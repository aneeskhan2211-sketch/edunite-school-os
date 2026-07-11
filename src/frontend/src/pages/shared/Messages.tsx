import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAnnouncements,
  useCreateThread,
  useSendMessage,
  useThread,
  useThreads,
} from "@/hooks/backend/messaging";
import { useRoleStore } from "@/store/roleStore";
import type { Announcement, Role, Thread } from "@/types";
import {
  ChevronDown,
  ChevronUp,
  Megaphone,
  MessageSquare,
  PenSquare,
  Search,
  Send,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

function formatTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  return (name ?? "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getParticipantName(id: string): string {
  const map: Record<string, string> = {
    "staff-1": "Maria Chen",
    "staff-2": "James Okafor",
    "staff-3": "Patricia Nguyen",
    "staff-4": "Robert Kim",
    "staff-5": "Diana Walsh",
    "staff-6": "Marcus Thompson",
    "staff-7": "Sophia Martinez",
    "staff-8": "David Patel",
    "staff-9": "Laura Johnson",
    "staff-10": "Kevin Brooks",
    "parent-1": "Sandra Rivera",
    "student-demo": "Alex Rivera",
    s1: "Jordan Ellis",
    s2: "Maya Okonkwo",
    s3: "Tyler Reyes",
    s4: "Priya Sharma",
    s5: "Marcus Brown",
    s6: "Aisha Williams",
  };
  return map[id] ?? id;
}

function getParticipantRole(id: string): string {
  if (id.startsWith("staff-")) {
    const roleMap: Record<string, string> = {
      "staff-1": "Teacher",
      "staff-2": "Co-Teacher",
      "staff-3": "School Admin",
      "staff-4": "Department Head",
      "staff-5": "Principal",
      "staff-6": "District Admin",
      "staff-7": "Counsellor",
      "staff-8": "SPED Coordinator",
      "staff-9": "Curriculum Coordinator",
      "staff-10": "Substitute",
    };
    return roleMap[id] ?? "Staff";
  }
  if (id.startsWith("parent-")) return "Parent";
  if (id.startsWith("s") && !id.startsWith("staff-")) return "Student";
  if (id === "student-demo") return "Student";
  return "User";
}

function ThreadListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }, (_, i) => i).map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg p-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MessageBubblesSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }, (_, i) => i).map((i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? "" : "flex-row-reverse"} gap-3`}
        >
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton
            className={`h-16 ${i % 2 === 0 ? "w-2/3" : "w-1/2"} rounded-xl`}
          />
        </div>
      ))}
    </div>
  );
}

function ComposeForm({
  onCancel,
  onSent,
}: {
  onCancel: () => void;
  onSent: () => void;
}) {
  const { currentUser } = useRoleStore();
  const createThread = useCreateThread();
  const [recipientQuery, setRecipientQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  const allContacts = useMemo(() => {
    const ids = [
      "staff-1",
      "staff-2",
      "staff-3",
      "staff-4",
      "staff-5",
      "staff-6",
      "staff-7",
      "staff-8",
      "staff-9",
      "staff-10",
      "parent-1",
      "student-demo",
      "s1",
      "s2",
      "s3",
      "s4",
      "s5",
      "s6",
    ];
    return ids
      .filter((id) => id !== currentUser?.id)
      .map((id) => ({
        id,
        name: getParticipantName(id),
        role: getParticipantRole(id),
      }));
  }, [currentUser?.id]);

  const filteredContacts = useMemo(() => {
    const q = (recipientQuery ?? "").toLowerCase();
    if (!q) return [];
    return allContacts.filter(
      (c) =>
        (c.name ?? "").toLowerCase().includes(q) ||
        (c.role ?? "").toLowerCase().includes(q),
    );
  }, [allContacts, recipientQuery]);

  function toggleRecipient(id: string) {
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  }

  function handleSend() {
    if (!subject.trim() || !body.trim() || selectedRecipients.length === 0)
      return;
    createThread.mutate(
      {
        subject: subject.trim(),
        participantIds: [...selectedRecipients, currentUser?.id ?? ""].filter(
          Boolean,
        ),
        body: body.trim(),
      },
      {
        onSuccess: () => {
          setSubject("");
          setBody("");
          setSelectedRecipients([]);
          setRecipientQuery("");
          onSent();
        },
      },
    );
  }

  return (
    <div className="border-b border-border pb-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">New Message</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          data-ocid="messages.compose_cancel_button"
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2">
            <Search
              className="h-4 w-4 text-muted-foreground shrink-0"
              aria-hidden
            />
            <Input
              type="text"
              value={recipientQuery}
              onChange={(e) => setRecipientQuery(e.target.value)}
              placeholder="Search by name or role..."
              className="flex-1 h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              data-ocid="messages.compose_recipient_input"
            />
          </div>
          {filteredContacts.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg max-h-48 overflow-auto">
              {filteredContacts.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => {
                    toggleRecipient(c.id);
                    setRecipientQuery("");
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2 ${
                    selectedRecipients.includes(c.id) ? "bg-primary/10" : ""
                  }`}
                >
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-coral shrink-0">
                    {getInitials(c.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {c.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.role}</p>
                  </div>
                  {selectedRecipients.includes(c.id) && (
                    <Badge
                      variant="success"
                      className="ml-auto shrink-0 text-[10px]"
                    >
                      Selected
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedRecipients.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedRecipients.map((id) => (
              <Badge key={id} variant="secondary" className="gap-1">
                {getParticipantName(id)}
                <button
                  type="button"
                  onClick={() => toggleRecipient(id)}
                  className="ml-0.5 hover:text-destructive"
                  data-ocid="messages.compose_remove_recipient_button"
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <Input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="w-full"
          data-ocid="messages.compose_subject_input"
        />

        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message..."
          rows={4}
          className="w-full resize-none"
          data-ocid="messages.compose_body_textarea"
        />

        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onCancel}
            data-ocid="messages.compose_cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={
              !subject.trim() ||
              !body.trim() ||
              selectedRecipients.length === 0 ||
              createThread.isPending
            }
            data-ocid="messages.compose_send_button"
          >
            <Send className="h-4 w-4" aria-hidden /> Send
          </Button>
        </div>
      </div>
    </div>
  );
}

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-full bg-warning/15 flex items-center justify-center shrink-0">
            <Megaphone className="h-4 w-4 text-warning" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {announcement.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {getParticipantName(announcement.authorId)} ·{" "}
              {getParticipantRole(announcement.authorId)} ·{" "}
              {formatTime(String(announcement.createdAt))}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-7 w-7"
          onClick={() => setExpanded((e) => !e)}
          data-ocid="messages.announcement_expand_button"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden />
          )}
        </Button>
      </div>
      <p
        className={`text-sm text-foreground mt-2 ${expanded ? "" : "line-clamp-2"}`}
      >
        {announcement.body}
      </p>
      {(announcement.targetRoles ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {(announcement.targetRoles ?? []).map((r) => (
            <Badge key={r} variant="neutral" className="text-[10px]">
              {r}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export interface MessagesPageProps {
  pageTitle?: string;
  pageSubtitle?: string;
  roleFilter?: Role;
}

export default function MessagesPage({
  pageTitle = "Messages",
  pageSubtitle = "Your conversations",
}: MessagesPageProps) {
  const { currentUser, currentRole } = useRoleStore();
  const { data: threads, isLoading: threadsLoading } = useThreads();
  const unreadCount = 0;
  const { data: announcements } = useAnnouncements(currentRole);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [activeTab, setActiveTab] = useState<"messages" | "announcements">(
    "messages",
  );

  const { data: threadDetail, isLoading: threadLoading } = useThread(
    selectedThreadId ?? "",
  );
  const sendMessage = useSendMessage();

  const selectedThread =
    threads?.find((t) => t.id === selectedThreadId) ?? null;

  function handleReply() {
    if (!replyText.trim() || !selectedThreadId) return;
    sendMessage.mutate(
      {
        threadId: selectedThreadId,
        body: replyText.trim(),
      },
      {
        onSuccess: () => {
          setReplyText("");
        },
      },
    );
  }

  return (
    <PageLayout width="wide">
      <PageHeader
        title={pageTitle}
        subtitle={pageSubtitle}
        actions={
          activeTab === "messages" ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCompose(true)}
              data-ocid="messages.new_message_button"
            >
              <PenSquare className="h-4 w-4" aria-hidden /> New Message
            </Button>
          ) : null
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-5">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setActiveTab("messages")}
          className={`relative ${
            activeTab === "messages"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          data-ocid="messages.tab_messages"
        >
          Messages
          {unreadCount ? (
            <Badge variant="info" className="ml-2 text-[10px]">
              {unreadCount}
            </Badge>
          ) : null}
          {activeTab === "messages" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setActiveTab("announcements")}
          className={`relative ${
            activeTab === "announcements"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          data-ocid="messages.tab_announcements"
        >
          Announcements
          {announcements && announcements.length > 0 ? (
            <Badge variant="neutral" className="ml-2 text-[10px]">
              {announcements.length}
            </Badge>
          ) : null}
          {activeTab === "announcements" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </Button>
      </div>

      {activeTab === "messages" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[calc(100vh-220px)] min-h-[400px]">
          {/* Thread list */}
          <SectionCard className="lg:col-span-1 flex flex-col overflow-hidden">
            {showCompose && (
              <ComposeForm
                onCancel={() => setShowCompose(false)}
                onSent={() => {
                  setShowCompose(false);
                  setSelectedThreadId(null);
                }}
              />
            )}

            <h2 className="text-sm font-semibold text-foreground mb-3 shrink-0">
              Conversations
            </h2>

            <div
              className="flex-1 overflow-y-auto -mx-2 px-2"
              data-ocid="messages.thread_list"
            >
              {threadsLoading ? (
                <ThreadListSkeleton />
              ) : !threads?.length ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No messages yet"
                  description="Start a conversation by clicking New Message."
                />
              ) : (
                <div className="space-y-1">
                  {threads.map((t, i) => (
                    <ThreadListItem
                      key={t.id}
                      thread={t}
                      active={selectedThreadId === t.id}
                      currentUserId={currentUser?.id ?? ""}
                      onClick={() => setSelectedThreadId(t.id)}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </div>
          </SectionCard>

          {/* Message view */}
          <div className="lg:col-span-2 flex flex-col h-full">
            {!selectedThreadId ? (
              <SectionCard className="h-full flex flex-col justify-center">
                <EmptyState
                  icon={MessageSquare}
                  title="Select a conversation"
                  description="Choose a thread from the left to read and reply."
                />
              </SectionCard>
            ) : (
              <SectionCard className="h-full flex flex-col overflow-hidden">
                {/* Thread header */}
                <div className="shrink-0 pb-3 border-b border-border mb-4">
                  <h2 className="text-sm font-semibold text-foreground">
                    {selectedThread?.subject}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedThread?.participantIds
                      .filter((id) => id !== currentUser?.id)
                      .map((id) => getParticipantName(id))
                      .join(", ")}
                  </p>
                </div>

                {/* Messages */}
                <div
                  className="flex-1 overflow-y-auto space-y-4 mb-4"
                  data-ocid="messages.message_list"
                >
                  {threadLoading ? (
                    <MessageBubblesSkeleton />
                  ) : !threadDetail?.messages?.length ? (
                    <EmptyState
                      icon={MessageSquare}
                      title="No messages yet"
                      description="Be the first to send a message in this thread."
                    />
                  ) : (
                    threadDetail.messages.map((msg, i) => {
                      const isMe = msg.senderId === currentUser?.id;
                      const senderName = getParticipantName(msg.senderId);
                      const senderRole = getParticipantRole(msg.senderId);
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
                          data-ocid={`messages.message.${i + 1}`}
                        >
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-coral shrink-0">
                            {getInitials(senderName)}
                          </div>
                          <div className="max-w-[75%] min-w-0">
                            <div
                              className={`rounded-xl px-4 py-3 text-sm ${
                                isMe
                                  ? "bg-primary text-coral-foreground"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              {!isMe && (
                                <p className="text-xs font-semibold mb-1 opacity-70">
                                  {senderName} ·{" "}
                                  <Badge
                                    variant={getRoleBadgeVariant(senderRole)}
                                    className="text-[10px]"
                                  >
                                    {senderRole}
                                  </Badge>
                                </p>
                              )}
                              <p className="break-words">{msg.content}</p>
                              <p
                                className={`text-[11px] mt-1.5 ${isMe ? "opacity-60" : "opacity-50"}`}
                              >
                                {formatTime(msg.sentAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Reply input */}
                <div className="shrink-0 border-t border-border pt-4">
                  <div className="flex items-end gap-2">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          handleReply();
                        }
                      }}
                      placeholder="Write a reply…"
                      rows={2}
                      className="flex-1 resize-none"
                      data-ocid="messages.reply_textarea"
                    />
                    <Button
                      onClick={handleReply}
                      disabled={!replyText.trim() || sendMessage.isPending}
                      className="shrink-0"
                      data-ocid="messages.reply_send_button"
                    >
                      <Send className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      ) : (
        /* Announcements tab */
        <div
          className="max-w-3xl space-y-3"
          data-ocid="messages.announcement_list"
        >
          {announcements && announcements.length > 0 ? (
            announcements.map((a, i) => (
              <div key={a.id} data-ocid={`messages.announcement.${i + 1}`}>
                <AnnouncementCard announcement={a} />
              </div>
            ))
          ) : (
            <EmptyState
              icon={Megaphone}
              title="No announcements"
              description="Role-scoped announcements will appear here when published."
            />
          )}
        </div>
      )}
    </PageLayout>
  );
}

function ThreadListItem({
  thread,
  active,
  currentUserId,
  onClick,
  index,
}: {
  thread: Thread;
  active: boolean;
  currentUserId: string;
  onClick: () => void;
  index: number;
}) {
  const otherParticipants = thread.participantIds.filter(
    (id) => id !== currentUserId,
  );
  const displayName =
    otherParticipants.map((id) => getParticipantName(id)).join(", ") || "You";
  const displayRole =
    otherParticipants.length === 1
      ? getParticipantRole(otherParticipants[0])
      : "Group";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-lg p-3 transition-colors duration-150 flex items-start gap-3 min-h-[44px] ${
        active
          ? "bg-primary/10 border border-primary/30"
          : "hover:bg-muted border border-transparent"
      }`}
      data-ocid={`messages.thread.${index + 1}`}
    >
      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-coral shrink-0">
        {getInitials(displayName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {thread.subject}
          </p>
          {thread.unreadCount > 0 && (
            <Badge variant="info" className="shrink-0 text-[10px]">
              {thread.unreadCount}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {displayName} · {displayRole}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {thread.lastMessage?.content}
        </p>
        <p className="text-[11px] text-muted-foreground/70 mt-0.5">
          {thread.lastMessage
            ? formatTime(thread.lastMessage.sentAt)
            : formatTime(thread.createdAt)}
        </p>
      </div>
    </button>
  );
}

function getRoleBadgeVariant(
  role: string,
):
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral" {
  const map: Record<
    string,
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral"
  > = {
    Teacher: "info",
    "Co-Teacher": "info",
    "School Admin": "warning",
    "Department Head": "info",
    Principal: "warning",
    "District Admin": "warning",
    Counsellor: "success",
    "SPED Coordinator": "success",
    "Curriculum Coordinator": "info",
    Substitute: "neutral",
    Parent: "secondary",
    Student: "secondary",
  };
  return map[role] ?? "neutral";
}
