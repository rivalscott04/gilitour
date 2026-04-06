import { useState } from "react";
import { Plus, MessageSquareText, Save, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatTemplates, ChatTemplate, evaluateTemplate } from "@/data/templates";
import { toast } from "@/lib/island-toast-api";
import { Textarea } from "@/components/ui/textarea";

export default function ChatTemplates() {
  const [templates, setTemplates] = useState<ChatTemplate[]>([...chatTemplates]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editContent, setEditContent] = useState("");

  const handleEdit = (t: ChatTemplate) => {
    setEditingId(t.id);
    setEditName(t.name);
    setEditContent(t.content);
  };

  const handleSave = () => {
    if (editingId) {
      const idx = chatTemplates.findIndex(x => x.id === editingId);
      if (idx !== -1) {
        chatTemplates[idx].name = editName;
        chatTemplates[idx].content = editContent;
      } else {
        chatTemplates.push({ id: editingId, name: editName, content: editContent });
      }
      setTemplates([...chatTemplates]);
      setEditingId(null);
      toast.success("Template saved!");
    }
  };

  const handleDelete = (id: string) => {
    const idx = chatTemplates.findIndex(x => x.id === id);
    if (idx !== -1) {
      chatTemplates.splice(idx, 1);
      setTemplates([...chatTemplates]);
      toast.success("Template deleted!");
    }
  };

  const handleAddNew = () => {
    const newId = `TPL-${Date.now()}`;
    setEditingId(newId);
    setEditName("New Template");
    setEditContent("{{greeting}} {{customerName}}, ");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Chat Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage reusable WhatsApp snippets. Use variables like{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-sm select-all">{"{{greeting}}"}</code>,{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-sm select-all">{"{{customerName}}"}</code>.
          </p>
        </div>
        <Button onClick={handleAddNew} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Template
        </Button>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3 items-start">
        <Clock className="w-5 h-5 text-primary mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Smart Greetings</h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Using <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono text-sm">{"{{greeting}}"}</code> will automatically translate to "Good morning", "Good afternoon", "Good evening", or "Good night" depending on the current local time when sending the message.
          </p>
          <div className="mt-2 text-sm text-muted-foreground">
            Preview right now: <span className="font-semibold text-foreground">{evaluateTemplate("{{greeting}}", {})}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {templates.map(t => (
          <div key={t.id} className="bg-card border border-border rounded-xl p-5 card-shadow transition-all">
            {editingId === t.id ? (
              <div className="space-y-4">
                <Input 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Template Name"
                  className="font-medium"
                />
                <Textarea 
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={4}
                  placeholder="Type your template message..."
                />
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="w-4 h-4" /> Save
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquareText className="w-4 h-4 text-muted-foreground" />
                    {t.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(t)} className="h-8 w-8 text-muted-foreground">
                      <span className="sr-only">Edit</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil w-4 h-4"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap font-medium text-muted-foreground mt-3 border border-border/50">
                  {t.content}
                </div>
                <div className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
                  <span className="font-semibold text-foreground">Preview:</span>
                  <span className="italic line-clamp-1">{evaluateTemplate(t.content, { customerName: "John Doe", tourName: "Bali Safari" })}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
