import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useRoleStore } from "@/store/roleStore";
import {
  Hash,
  MessageCircle,
  Pin,
  PinOff,
  Reply,
  Send,
  Shield,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

interface Channel {
  id: number;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: number;
  isRoleScoped: boolean;
  scopedRoles: string[];
  isArchived: boolean;
}

interface ChannelMessage {
  id: number;
  channelId: number;
  authorId: string;
  authorName: string;
  content: string;
  sentAt: number;
  isPinned: boolean;
  mentionedUsers: string[];
  parentId?: number;
}

interface BoardItem {
  id: number;
  channelId?: number;
  title: string;
  content: string;
  createdBy: string;
  createdAt: number;
  isPinned: boolean;
  pinnedAt?: number;
  pinnedBy?: string;
}

const DEMO_CHANNELS: Channel[] = [
  {
    id: 1,
    name: "General",
    description: "School-wide announcements and general discussion",
    createdBy: "staff-3",
    createdAt: Date.now() - 86400000 * 30,
    isRoleScoped: false,
    scopedRoles: [],
    isArchived: false,
  },
  {
    id: 2,
    name: "Teachers",
    description: "Teaching staff coordination and resources",
    createdBy: "staff-1",
    createdAt: Date.now() - 86400000 * 20,
    isRoleScoped: true,
    scopedRoles: ["teacher", "coTeacher", "departmentHead"],
    isArchived: false,
  },
  {
    id: 3,
    name: "Counsellors",
    description: "Counselling team private channel",
    createdBy: "staff-7",
    createdAt: Date.now() - 86400000 * 15,
    isRoleScoped: true,
    scopedRoles: ["counsellor"],
    isArchived: false,
  },
];

const DEMO_MESSAGES: ChannelMessage[] = [
  // General channel
  {
    id: 101,
    channelId: 1,
    authorId: "staff-3",
    authorName: "Patricia Nguyen",
    content:
      "Welcome to the Staff Room! This is our space for school-wide coordination. Please keep announcements brief and actionable.",
    sentAt: Date.now() - 86400000 * 5,
    isPinned: true,
    mentionedUsers: [],
  },
  {
    id: 102,
    channelId: 1,
    authorId: "staff-5",
    authorName: "Diana Walsh",
    content:
      "Reminder: faculty meeting this Thursday at 3:30 PM in the library. @Patricia Nguyen will share the agenda by Wednesday.",
    sentAt: Date.now() - 86400000 * 2,
    isPinned: false,
    mentionedUsers: ["staff-3"],
  },
  {
    id: 103,
    channelId: 1,
    authorId: "staff-1",
    authorName: "Maria Chen",
    content:
      'The math department has finished the mid-term review materials. They are in the shared drive under "Math / Assessments / Fall 2025".',
    sentAt: Date.now() - 86400000,
    isPinned: false,
    mentionedUsers: [],
  },
  {
    id: 104,
    channelId: 1,
    authorId: "staff-4",
    authorName: "Robert Kim",
    content:
      "Great work, Maria! I will share these with the science team as a model.",
    sentAt: Date.now() - 86400000 + 3600000,
    isPinned: false,
    mentionedUsers: [],
    parentId: 103,
  },
  {
    id: 105,
    channelId: 1,
    authorId: "staff-7",
    authorName: "Sophia Martinez",
    content:
      "Heads up: we have three students with IEP renewals due in the next two weeks. I have sent individual messages to their case managers.",
    sentAt: Date.now() - 43200000,
    isPinned: false,
    mentionedUsers: [],
  },
  {
    id: 106,
    channelId: 1,
    authorId: "staff-3",
    authorName: "Patricia Nguyen",
    content:
      "Thank you for the proactive outreach, Sophia. Let me know if you need anything from admin.",
    sentAt: Date.now() - 39600000,
    isPinned: false,
    mentionedUsers: [],
    parentId: 105,
  },
  {
    id: 107,
    channelId: 1,
    authorId: "staff-5",
    authorName: "Diana Walsh",
    content:
      "Please welcome Kevin Brooks, who is joining us as a regular substitute this semester. Kevin, feel free to ask anything here.",
    sentAt: Date.now() - 18000000,
    isPinned: false,
    mentionedUsers: [],
  },
  {
    id: 108,
    channelId: 1,
    authorId: "staff-10",
    authorName: "Kevin Brooks",
    content:
      "Thank you, Principal Walsh. Looking forward to working with everyone.",
    sentAt: Date.now() - 14400000,
    isPinned: false,
    mentionedUsers: [],
    parentId: 107,
  },
  // Teachers channel
  {
    id: 201,
    channelId: 2,
    authorId: "staff-1",
    authorName: "Maria Chen",
    content:
      "Has anyone tried the new formative assessment tool? I am piloting it with my Algebra II class and the real-time feedback is excellent.",
    sentAt: Date.now() - 86400000 * 3,
    isPinned: false,
    mentionedUsers: [],
  },
  {
    id: 202,
    channelId: 2,
    authorId: "staff-2",
    authorName: "James Okafor",
    content:
      "I have been using it for two weeks. The auto-grading feature saves about 20 minutes per assignment. Happy to demo at the next department meeting.",
    sentAt: Date.now() - 86400000 * 3 + 7200000,
    isPinned: false,
    mentionedUsers: [],
    parentId: 201,
  },
  {
    id: 203,
    channelId: 2,
    authorId: "staff-4",
    authorName: "Robert Kim",
    content:
      "The science department would love to see that demo, James. Could you present at our joint meeting next month?",
    sentAt: Date.now() - 86400000 * 2,
    isPinned: false,
    mentionedUsers: [],
  },
  {
    id: 204,
    channelId: 2,
    authorId: "staff-1",
    authorName: "Maria Chen",
    content:
      "Quick note: the grading period closes this Friday. Please have all grades entered by 4 PM so we can generate reports over the weekend.",
    sentAt: Date.now() - 86400000,
    isPinned: true,
    mentionedUsers: [],
  },
  {
    id: 205,
    channelId: 2,
    authorId: "staff-2",
    authorName: "James Okafor",
    content: "All caught up on my end. Thanks for the reminder, Maria.",
    sentAt: Date.now() - 72000000,
    isPinned: false,
    mentionedUsers: [],
    parentId: 204,
  },
  {
    id: 206,
    channelId: 2,
    authorId: "staff-4",
    authorName: "Robert Kim",
    content: "Same here. Science grades are finalized.",
    sentAt: Date.now() - 68400000,
    isPinned: false,
    mentionedUsers: [],
    parentId: 204,
  },
  // Counsellors channel
  {
    id: 301,
    channelId: 3,
    authorId: "staff-7",
    authorName: "Sophia Martinez",
    content:
      "Team check-in: we have five new referrals this week. I have prioritised the two urgent cases and scheduled intake meetings for tomorrow.",
    sentAt: Date.now() - 86400000 * 2,
    isPinned: false,
    mentionedUsers: [],
  },
  {
    id: 302,
    channelId: 3,
    authorId: "staff-7",
    authorName: "Sophia Martinez",
    content:
      "Reminder: all intervention notes must be updated in the system by end of day Friday. This is for our quarterly compliance review.",
    sentAt: Date.now() - 86400000,
    isPinned: true,
    mentionedUsers: [],
  },
  {
    id: 303,
    channelId: 3,
    authorId: "staff-7",
    authorName: "Sophia Martinez",
    content:
      'The group session materials for "Study Skills" are ready. They are in the shared folder. Please review before next Tuesday\'s session.',
    sentAt: Date.now() - 43200000,
    isPinned: false,
    mentionedUsers: [],
  },
  {
    id: 304,
    channelId: 3,
    authorId: "staff-7",
    authorName: "Sophia Martinez",
    content:
      "Also: we are short-staffed for the lunch mindfulness sessions this week. If anyone can cover Wednesday, please let me know.",
    sentAt: Date.now() - 36000000,
    isPinned: false,
    mentionedUsers: [],
  },
];

const DEMO_BOARD_ITEMS: BoardItem[] = [
  {
    id: 1,
    channelId: 1,
    title: "Staff Room Guidelines",
    content:
      "Keep conversations respectful and professional. Use @mentions sparingly. Pinned items appear on the board for easy reference. Report any concerns to the admin team.",
    createdBy: "staff-3",
    createdAt: Date.now() - 86400000 * 30,
    isPinned: true,
    pinnedAt: Date.now() - 86400000 * 29,
    pinnedBy: "staff-3",
  },
  {
    id: 2,
    channelId: 1,
    title: "Emergency Contact List",
    content:
      "Main office: ext. 100 | Nurse: ext. 105 | Security: ext. 110 | Facilities: ext. 120. After hours, call the district emergency line at (555) 010-9999.",
    createdBy: "staff-3",
    createdAt: Date.now() - 86400000 * 25,
    isPinned: false,
  },
  {
    id: 3,
    channelId: 2,
    title: "Grading Period Deadlines",
    content:
      "Fall mid-term: Oct 15 | Fall final: Dec 20 | Spring mid-term: Mar 15 | Spring final: May 30. All grades must be entered by 4 PM on the closing date.",
    createdBy: "staff-1",
    createdAt: Date.now() - 86400000 * 10,
    isPinned: false,
  },
];

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: "short" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-rose-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-sky-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-pink-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function highlightMentions(text: string): React.ReactNode {
  const parts = text.split(/(@\w+(?:\s\w+)?)/g);
  const out: React.ReactNode[] = [];
  let seq = 0;
  for (const part of parts) {
    const key = part.startsWith("@")
      ? `mention-${part}-${seq}`
      : `text-${part.slice(0, 8)}-${seq}`;
    if (part.startsWith("@")) {
      out.push(
        <span key={key} className="font-semibold text-[oklch(var(--primary))]">
          {part}
        </span>,
      );
    } else {
      out.push(<span key={key}>{part}</span>);
    }
    seq += 1;
  }
  return out;
}

export default function StaffRoomPage() {
  const { currentUser } = useRoleStore();
  const [activeChannelId, setActiveChannelId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"messages" | "board">("messages");
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(
    new Set(),
  );
  const [composeText, setComposeText] = useState("");
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [channels, setChannels] = useState<Channel[]>(DEMO_CHANNELS);
  const [messages, setMessages] = useState<ChannelMessage[]>(DEMO_MESSAGES);
  const [boardItems, setBoardItems] = useState<BoardItem[]>(DEMO_BOARD_ITEMS);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardContent, setNewBoardContent] = useState("");
  const [showAddBoard, setShowAddBoard] = useState(false);

  const activeChannel = useMemo(
    () => channels.find((c) => c.id === activeChannelId),
    [channels, activeChannelId],
  );

  const channelMessages = useMemo(
    () =>
      messages.filter((m) => m.channelId === activeChannelId && !m.parentId),
    [messages, activeChannelId],
  );

  const channelBoardItems = useMemo(
    () =>
      boardItems
        .filter((b) => b.channelId === activeChannelId)
        .sort((a, b) => Number(b.isPinned) - Number(a.isPinned)),
    [boardItems, activeChannelId],
  );

  function getReplies(parentId: number): ChannelMessage[] {
    return messages.filter((m) => m.parentId === parentId);
  }

  function getLastMessage(channelId: number): ChannelMessage | undefined {
    const msgs = messages.filter((m) => m.channelId === channelId);
    return msgs.sort((a, b) => b.sentAt - a.sentAt)[0];
  }

  function getUnreadCount(channelId: number): number {
    // Demo: random small unread counts for non-active channels
    if (channelId === activeChannelId) return 0;
    const counts: Record<number, number> = { 1: 2, 2: 1, 3: 0 };
    return counts[channelId] ?? 0;
  }

  function handleSend() {
    if (!composeText.trim()) return;
    const newMsg: ChannelMessage = {
      id: Date.now(),
      channelId: activeChannelId,
      authorId: currentUser?.id ?? "unknown",
      authorName: currentUser
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : "You",
      content: composeText.trim(),
      sentAt: Date.now(),
      isPinned: false,
      mentionedUsers: [],
      parentId: replyToId ?? undefined,
    };
    setMessages((prev) => [...prev, newMsg]);
    setComposeText("");
    setReplyToId(null);
  }

  function handleCreateChannel() {
    if (!newChannelName.trim()) return;
    const newChannel: Channel = {
      id: Date.now(),
      name: newChannelName.trim(),
      description: newChannelDesc.trim() || undefined,
      createdBy: currentUser?.id ?? "unknown",
      createdAt: Date.now(),
      isRoleScoped: false,
      scopedRoles: [],
      isArchived: false,
    };
    setChannels((prev) => [...prev, newChannel]);
    setNewChannelName("");
    setNewChannelDesc("");
    setShowCreateChannel(false);
    setActiveChannelId(newChannel.id);
  }

  function handlePinMessage(msgId: number) {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, isPinned: !m.isPinned } : m)),
    );
  }

  function handleToggleBoardPin(itemId: number) {
    setBoardItems((prev) =>
      prev.map((b) =>
        b.id === itemId
          ? {
              ...b,
              isPinned: !b.isPinned,
              pinnedAt: !b.isPinned ? Date.now() : undefined,
              pinnedBy: !b.isPinned ? (currentUser?.id ?? "you") : undefined,
            }
          : b,
      ),
    );
  }

  function handleAddBoardItem() {
    if (!newBoardTitle.trim() || !newBoardContent.trim()) return;
    const newItem: BoardItem = {
      id: Date.now(),
      channelId: activeChannelId,
      title: newBoardTitle.trim(),
      content: newBoardContent.trim(),
      createdBy: currentUser?.id ?? "you",
      createdAt: Date.now(),
      isPinned: false,
    };
    setBoardItems((prev) => [...prev, newItem]);
    setNewBoardTitle("");
    setNewBoardContent("");
    setShowAddBoard(false);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* LEFT COLUMN — Channel list */}
      <div className="flex w-[280px] shrink-0 flex-col border-r border-border bg-card">
        {/* School crest */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[oklch(var(--sidebar))]">
            <Shield
              className="h-5 w-5 text-[oklch(var(--sidebar-primary))]"
              aria-hidden
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground font-display">
              Lincoln High School
            </p>
            <p className="truncate text-[11px] text-muted-foreground font-display">
              Staff Room
            </p>
          </div>
        </div>

        {/* Channel list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {channels.map((channel) => {
            const lastMsg = getLastMessage(channel.id);
            const unread = getUnreadCount(channel.id);
            const isActive = channel.id === activeChannelId;
            return (
              <button
                key={channel.id}
                type="button"
                onClick={() => {
                  setActiveChannelId(channel.id);
                  setActiveTab("messages");
                }}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150",
                  isActive
                    ? "bg-[oklch(var(--primary)/0.08)] border-l-2 border-primary"
                    : "hover:bg-muted/50",
                )}
                data-ocid={`staffroom.channel.${channel.id}`}
              >
                <div className="mt-0.5 shrink-0">
                  <Hash
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "truncate text-sm font-semibold",
                        isActive ? "text-foreground" : "text-foreground",
                      )}
                    >
                      {channel.name}
                    </span>
                    {unread > 0 ? (
                      <Badge
                        variant="default"
                        className="h-5 min-w-[20px] px-1.5 text-[10px]"
                      >
                        {unread}
                      </Badge>
                    ) : null}
                  </div>
                  {lastMsg ? (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {lastMsg.authorName}: {lastMsg.content}
                    </p>
                  ) : (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      No messages yet
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Create channel */}
        <div className="border-t border-border px-3 py-3">
          {showCreateChannel ? (
            <div className="space-y-2">
              <Input
                placeholder="Channel name"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="h-8 text-sm"
                data-ocid="staffroom.create_channel_name"
              />
              <Textarea
                placeholder="Description (optional)"
                value={newChannelDesc}
                onChange={(e) => setNewChannelDesc(e.target.value)}
                className="min-h-[60px] text-sm"
                data-ocid="staffroom.create_channel_desc"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="flex-1"
                  onClick={handleCreateChannel}
                  data-ocid="staffroom.create_channel_save"
                >
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCreateChannel(false)}
                  data-ocid="staffroom.create_channel_cancel"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowCreateChannel(true)}
              data-ocid="staffroom.create_channel_button"
            >
              + Create Channel
            </Button>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN — Channel content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-background">
        {activeChannel ? (
          <>
            {/* Channel header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-bold text-foreground font-display">
                    {activeChannel.name}
                  </h2>
                  {activeChannel.isRoleScoped ? (
                    <Badge variant="secondary" className="text-[10px]">
                      Role-scoped
                    </Badge>
                  ) : null}
                </div>
                {activeChannel.description ? (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {activeChannel.description}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    {activeChannel.isRoleScoped
                      ? activeChannel.scopedRoles.length
                      : "All staff"}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={activeTab === "messages" ? "default" : "outline"}
                    onClick={() => setActiveTab("messages")}
                    data-ocid="staffroom.tab.messages"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Messages
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={activeTab === "board" ? "default" : "outline"}
                    onClick={() => setActiveTab("board")}
                    data-ocid="staffroom.tab.board"
                  >
                    <Pin className="h-3.5 w-3.5" />
                    Board
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages tab */}
            {activeTab === "messages" ? (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {channelMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <MessageCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">
                        No messages yet — start the conversation
                      </p>
                    </div>
                  ) : (
                    channelMessages.map((msg) => {
                      const replies = getReplies(msg.id);
                      const isExpanded = expandedReplies.has(msg.id);
                      return (
                        <div key={msg.id} className="group">
                          <div className="flex gap-3">
                            <div
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                                getAvatarColor(msg.authorName),
                              )}
                            >
                              {getInitials(msg.authorName)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">
                                  {msg.authorName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(msg.sentAt)}
                                </span>
                                {msg.isPinned ? (
                                  <Pin className="h-3 w-3 text-[oklch(var(--primary))]" />
                                ) : null}
                              </div>
                              <p className="mt-0.5 text-sm text-foreground leading-relaxed">
                                {highlightMentions(msg.content)}
                              </p>
                              <div className="mt-1.5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setReplyToId(msg.id)}
                                  className="gap-1 text-xs text-muted-foreground hover:text-primary"
                                  data-ocid="staffroom.reply_button"
                                >
                                  <Reply className="h-3 w-3" />
                                  Reply
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePinMessage(msg.id)}
                                  className="gap-1 text-xs text-muted-foreground hover:text-primary"
                                  data-ocid="staffroom.pin_message_button"
                                >
                                  <Pin className="h-3 w-3" />
                                  {msg.isPinned ? "Unpin" : "Pin to board"}
                                </Button>
                              </div>

                              {/* Replies */}
                              {replies.length > 0 ? (
                                <div className="mt-2">
                                  <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    onClick={() =>
                                      setExpandedReplies((prev) => {
                                        const next = new Set(prev);
                                        if (next.has(msg.id)) {
                                          next.delete(msg.id);
                                        } else {
                                          next.add(msg.id);
                                        }
                                        return next;
                                      })
                                    }
                                    className="h-auto p-0 text-xs font-medium text-primary"
                                    data-ocid="staffroom.replies_toggle"
                                  >
                                    {isExpanded
                                      ? "Hide replies"
                                      : `${replies.length} repl${replies.length === 1 ? "y" : "ies"}`}
                                  </Button>
                                  {isExpanded ? (
                                    <div className="mt-2 ml-4 space-y-3 border-l-2 border-border pl-3">
                                      {replies.map((reply) => (
                                        <div
                                          key={reply.id}
                                          className="flex gap-2"
                                        >
                                          <div
                                            className={cn(
                                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
                                              getAvatarColor(reply.authorName),
                                            )}
                                          >
                                            {getInitials(reply.authorName)}
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs font-semibold text-foreground">
                                                {reply.authorName}
                                              </span>
                                              <span className="text-[11px] text-muted-foreground">
                                                {formatTime(reply.sentAt)}
                                              </span>
                                            </div>
                                            <p className="mt-0.5 text-xs text-foreground leading-relaxed">
                                              {highlightMentions(reply.content)}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Compose area */}
                <div className="border-t border-border px-6 py-4">
                  {replyToId ? (
                    <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Reply className="h-3 w-3" />
                      <span>Replying to message</span>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => setReplyToId(null)}
                        className="h-auto p-0 text-primary"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : null}
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="Write a message..."
                      value={composeText}
                      onChange={(e) => setComposeText(e.target.value)}
                      className="min-h-[60px] flex-1 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          handleSend();
                        }
                      }}
                      data-ocid="staffroom.compose_input"
                    />
                    <Button
                      type="button"
                      onClick={handleSend}
                      disabled={!composeText.trim()}
                      className="self-end"
                      data-ocid="staffroom.send_button"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send
                    </Button>
                  </div>
                </div>
              </>
            ) : null}

            {/* Board tab */}
            {activeTab === "board" ? (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {channelBoardItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Pin className="h-10 w-10 text-muted-foreground/40 mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">
                        No board items yet
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {channelBoardItems.map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            "rounded-xl border p-4 transition-smooth",
                            item.isPinned
                              ? "border-primary/30 bg-[oklch(var(--primary)/0.04)]"
                              : "border-border bg-card",
                          )}
                          data-ocid={`staffroom.board_item.${item.id}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {item.isPinned ? (
                                <Pin className="h-4 w-4 text-primary shrink-0" />
                              ) : null}
                              <h3 className="text-sm font-semibold text-foreground truncate">
                                {item.title}
                              </h3>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleBoardPin(item.id)}
                              aria-label={item.isPinned ? "Unpin" : "Pin"}
                              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary"
                              data-ocid={`staffroom.board_pin.${item.id}`}
                            >
                              {item.isPinned ? (
                                <PinOff className="h-4 w-4" />
                              ) : (
                                <Pin className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="mt-2 text-sm text-foreground leading-relaxed line-clamp-4">
                            {item.content}
                          </p>
                          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              By{" "}
                              {item.createdBy === "staff-3"
                                ? "Patricia Nguyen"
                                : item.createdBy === "staff-1"
                                  ? "Maria Chen"
                                  : "You"}
                            </span>
                            <span>·</span>
                            <span>{formatTime(item.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add to board form */}
                  <div className="mt-6 border-t border-border pt-4">
                    {showAddBoard ? (
                      <div className="space-y-3">
                        <Input
                          placeholder="Title"
                          value={newBoardTitle}
                          onChange={(e) => setNewBoardTitle(e.target.value)}
                          className="text-sm"
                          data-ocid="staffroom.board_title_input"
                        />
                        <Textarea
                          placeholder="Content"
                          value={newBoardContent}
                          onChange={(e) => setNewBoardContent(e.target.value)}
                          className="min-h-[80px] text-sm"
                          data-ocid="staffroom.board_content_input"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddBoardItem}
                            data-ocid="staffroom.board_save_button"
                          >
                            Save to Board
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setShowAddBoard(false)}
                            data-ocid="staffroom.board_cancel_button"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddBoard(true)}
                        data-ocid="staffroom.add_board_button"
                      >
                        + Add to Board
                      </Button>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Select a channel to view messages
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
