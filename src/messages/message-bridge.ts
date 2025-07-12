// Message bridge to break circular dependency
export interface MessageBridge {
  getCustomRuleMessage(ruleName: string): string | undefined;
}

// Global message bridge instance
let messageBridge: MessageBridge | null = null;

export function setMessageBridge(bridge: MessageBridge): void {
  messageBridge = bridge;
}

export function getMessageBridge(): MessageBridge | null {
  return messageBridge;
}