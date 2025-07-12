import { AsyncValidationTask, ValidationContext, ValidationError } from '../types';
import { MessageResolver } from '../messages/message-resolver';

interface TaskResult {
  passed: boolean;
  message?: string;
  context: ValidationContext;
  ruleName: string;
  value: any;
}

export class AsyncValidator {
  private readonly batchSize = 50;

  constructor(private readonly messageResolver: MessageResolver) {}

  async validateTasks(tasks: AsyncValidationTask[]): Promise<ValidationError[]> {
    if (tasks.length === 0) return [];

    const errors: ValidationError[] = [];
    
    // Process tasks in batches to avoid overwhelming the system
    for (let i = 0; i < tasks.length; i += this.batchSize) {
      const batch = tasks.slice(i, i + this.batchSize);
      const batchErrors = await this.processBatch(batch);
      errors.push(...batchErrors);
    }

    return errors;
  }

  private async processBatch(batch: AsyncValidationTask[]): Promise<ValidationError[]> {
    const results = await Promise.allSettled(
      batch.map(task => this.executeTask(task))
    );

    const errors: ValidationError[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const taskResult = result.value;
        if (!taskResult.passed && taskResult.message) {
          errors.push(this.createValidationError(taskResult));
        }
      } else {
        // Handle rejected promises
        const task = batch[index] as AsyncValidationTask;
        errors.push({
          field: task.context.field,
          rule: task.rule,
          message: `Task execution failed: ${result.reason?.message || 'Unknown error'}`,
          value: task.value,
          parameters: task.context.parameters || []
        });
      }
    });

    return errors;
  }

  private async executeTask(task: AsyncValidationTask): Promise<TaskResult> {
    try {
      const result = await task.validator(task.value, task.context);
      
      return {
        passed: result.passed,
        message: result.message || (
          !result.passed ? this.resolveMessage(task) : 'invalid'
        ),
        context: task.context,
        ruleName: task.rule,
        value: task.value
      };
    } catch (error) {
      return {
        passed: false,
        message: this.resolveMessage(task) || `Validation failed: ${(error as Error).message}`,
        context: task.context,
        ruleName: task.rule,
        value: task.value
      };
    }
  }

  private resolveMessage(task: AsyncValidationTask): string {
    return this.messageResolver.resolve({
      ...task.context,
      rule: task.rule,
      value: task.value,
      parameters: task.context.parameters || []
    });
  }

  private createValidationError(taskResult: TaskResult): ValidationError {
    return {
      field: taskResult.context.field,
      rule: taskResult.ruleName,
      message: taskResult.message!,
      value: taskResult.value,
      parameters: taskResult.context.parameters || []
    };
  }

  // Public method to allow dynamic batch size configuration
  setBatchSize(size: number): void {
    if (size <= 0) {
      throw new Error('Batch size must be greater than 0');
    }
    (this as any).batchSize = size;
  }

  getBatchSize(): number {
    return this.batchSize;
  }
}