export interface ChatTemplate {
  id: string;
  name: string;
  content: string;
}

export let chatTemplates: ChatTemplate[] = [
  {
    id: "TPL-001",
    name: "Booking Reminder",
    content: "{{greeting}} {{customerName}}! Just a friendly reminder for your upcoming {{tourName}}. We will send further details shortly. Please confirm if you are ready!"
  },
  {
    id: "TPL-002",
    name: "Thank You",
    content: "{{greeting}} {{customerName}}, thanks for choosing us! We hope you enjoyed the {{tourName}}."
  },
  {
    id: "TPL-003",
    name: "Payment Request",
    content: "{{greeting}} {{customerName}}, please kindly complete the payment for your {{tourName}} booking at your earliest convenience."
  }
];

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export function evaluateTemplate(templateContent: string, data: { customerName?: string; tourName?: string }): string {
  let result = templateContent;
  result = result.replace(/{{greeting}}/g, getGreeting());
  if (data.customerName) result = result.replace(/{{customerName}}/g, data.customerName);
  if (data.tourName) result = result.replace(/{{tourName}}/g, data.tourName);
  return result;
}
