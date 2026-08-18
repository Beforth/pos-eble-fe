import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  ArrowUp,
  Clock3,
  Maximize2,
  MessageSquare,
  Minimize2,
  Plus,
  X,
} from 'lucide-react'
import { brand } from '../../theme/brand'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
}

interface ChatSession {
  id: string
  title: string
  updatedAt: number
  messages: ChatMessage[]
}

interface SupportAgentDrawerProps {
  open: boolean
  onClose: () => void
}

const SUGGESTIONS = [
  'Compare net sales for this month versus the same month last year.',
  "Add a new menu item called 'Spicy Mango Salad' to the appetizers section, priced at 179.",
  "Please add 'Gourmet Mushroom Pizza' as a main course for 525.",
  'How to create purchase request?',
]

/** Seed so Recent chats isn't empty on first open. */
const SEED_SESSIONS: ChatSession[] = [
  {
    id: 'seed-1',
    title: 'Compare net sales for this month versus last year',
    updatedAt: Date.now() - 1000 * 60 * 45,
    messages: [
      {
        id: 'seed-1-u',
        role: 'user',
        text: 'Compare net sales for this month versus the same month last year.',
      },
      {
        id: 'seed-1-a',
        role: 'assistant',
        text: `This month's net sales are tracking ahead of the same month last year for ${brand.shortName}. (Demo reply.)`,
      },
    ],
  },
  {
    id: 'seed-2',
    title: "Add menu item 'Spicy Mango Salad'",
    updatedAt: Date.now() - 1000 * 60 * 60 * 5,
    messages: [
      {
        id: 'seed-2-u',
        role: 'user',
        text: "Add a new menu item called 'Spicy Mango Salad' to the appetizers section, priced at 179.",
      },
      {
        id: 'seed-2-a',
        role: 'assistant',
        text: "I can help add 'Spicy Mango Salad' under Appetizers at ₹ 179. (Demo reply.)",
      },
    ],
  },
  {
    id: 'seed-3',
    title: 'How to create purchase request?',
    updatedAt: Date.now() - 1000 * 60 * 60 * 26,
    messages: [
      {
        id: 'seed-3-u',
        role: 'user',
        text: 'How to create purchase request?',
      },
      {
        id: 'seed-3-a',
        role: 'assistant',
        text: 'Go to Inventory → Purchase Requests → Create New. (Demo reply.)',
      },
    ],
  },
]

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function formatRelativeTime(ts: number): string {
  const mins = Math.max(1, Math.round((Date.now() - ts) / 60_000))
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function SupportAgentDrawer({ open, onClose }: SupportAgentDrawerProps) {
  const [sessions, setSessions] = useState<ChatSession[]>(SEED_SESSIONS)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const activeSession =
    sessions.find((session) => session.id === activeSessionId) ?? null
  const messages = activeSession?.messages ?? []
  const hasChat = messages.length > 0

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (showHistory) {
        setShowHistory(false)
        return
      }
      onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, showHistory])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => inputRef.current?.focus(), 280)
    return () => {
      document.body.style.overflow = previous
      window.clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setShowHistory(false)
      setExpanded(false)
    }
  }, [open])

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  function startNewChat() {
    setActiveSessionId(null)
    setDraft('')
    setShowHistory(false)
    inputRef.current?.focus()
  }

  function openSession(sessionId: string) {
    setActiveSessionId(sessionId)
    setShowHistory(false)
    inputRef.current?.focus()
  }

  function upsertActiveSession(
    updater: (messages: ChatMessage[]) => ChatMessage[],
    titleHint?: string,
  ) {
    if (activeSessionId) {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === activeSessionId
            ? {
                ...session,
                messages: updater(session.messages),
                updatedAt: Date.now(),
              }
            : session,
        ),
      )
      return
    }

    const newMessages = updater([])
    const firstUser = newMessages.find((message) => message.role === 'user')
    const newSession: ChatSession = {
      id: createId(),
      title: (titleHint ?? firstUser?.text ?? 'New chat').slice(0, 64),
      updatedAt: Date.now(),
      messages: newMessages,
    }
    setActiveSessionId(newSession.id)
    setSessions((prev) => [newSession, ...prev])
  }

  function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return

    const userMsg: ChatMessage = {
      id: createId(),
      role: 'user',
      text: trimmed,
    }
    const reply: ChatMessage = {
      id: createId(),
      role: 'assistant',
      text: `Got it — I'll help with that for ${brand.shortName}. (Demo reply; connect a real agent API later.)`,
    }

    upsertActiveSession((prev) => [...prev, userMsg, reply], trimmed)
    setDraft('')
    setShowHistory(false)
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    sendMessage(draft)
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close support panel"
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Support Agent"
        className={`absolute inset-y-0 right-0 flex flex-col overflow-hidden bg-card shadow-2xl transition-all duration-300 ease-out ${
          expanded ? 'w-full max-w-3xl' : 'w-full max-w-md'
        } ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--color-line) 1px, transparent 0)',
          backgroundSize: '18px 18px',
        }}
      >
        {/* Header */}
        <header className="relative z-30 flex h-12 shrink-0 items-center justify-between border-b border-line bg-card/95 px-3 backdrop-blur-sm">
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setShowHistory((prev) => !prev)}
              aria-label="Recent chats"
              aria-pressed={showHistory}
              className={`rounded-lg p-2 transition-colors ${
                showHistory
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:bg-page hover:text-ink'
              }`}
            >
              <Clock3 size={18} />
            </button>
            <button
              type="button"
              onClick={startNewChat}
              aria-label="Start new chat"
              title="Start new chat"
              className="rounded-lg p-2 text-muted transition-colors hover:bg-page hover:text-ink"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              aria-label={expanded ? 'Shrink panel' : 'Expand panel'}
              className="rounded-lg p-2 text-muted transition-colors hover:bg-page hover:text-ink"
            >
              {expanded ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-2 text-muted transition-colors hover:bg-page hover:text-ink"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Main chat area — Welcome stays underneath */}
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-6">
            {!hasChat ? (
              <div className="flex min-h-full flex-col justify-center">
                <h2 className="text-3xl font-bold tracking-tight text-primary">
                  Welcome
                </h2>
                <p className="mt-1 text-base text-muted">
                  What are we doing today
                </p>

                <ul className="mt-8 space-y-3">
                  {SUGGESTIONS.map((suggestion) => (
                    <li key={suggestion}>
                      <button
                        type="button"
                        onClick={() => sendMessage(suggestion)}
                        className="w-full rounded-xl border border-line bg-card px-4 py-3 text-left text-sm leading-snug text-primary shadow-sm transition-colors hover:bg-primary/5"
                      >
                        {suggestion}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ul className="space-y-3">
                {messages.map((message) => (
                  <li
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        message.role === 'user'
                          ? 'rounded-br-md bg-primary text-white'
                          : 'rounded-bl-md border border-line bg-card text-ink shadow-sm'
                      }`}
                    >
                      {message.text}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Composer */}
          <div className="shrink-0 border-t border-line bg-card/95 px-4 pb-4 pt-3 backdrop-blur-sm">
            <form onSubmit={onSubmit} className="relative">
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    sendMessage(draft)
                  }
                }}
                rows={2}
                placeholder="Ask me anything..."
                className="w-full resize-none rounded-2xl border border-line bg-card py-3 pl-4 pr-12 text-sm text-ink shadow-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                aria-label="Send message"
                className="absolute bottom-3 right-3 flex size-8 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-muted"
              >
                <ArrowUp size={16} strokeWidth={2.5} />
              </button>
            </form>
            <p className="mt-2 text-center text-[11px] leading-snug text-muted">
              Note: {brand.shortName} Support Agent is continuously learning —
              responses may occasionally be incomplete or incorrect.
            </p>
          </div>

          {/* Recent chats — full panel below header, slides from right */}
          <div
            className={`absolute inset-0 z-20 ${showHistory ? 'pointer-events-auto' : 'pointer-events-none'}`}
            aria-hidden={!showHistory}
          >
            <div
              role="dialog"
              aria-label="Recent chats"
              className={`absolute inset-0 flex flex-col bg-card transition-transform duration-300 ease-out ${
                showHistory ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-4">
                <h3 className="text-sm font-bold text-ink">Recent chats</h3>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  aria-label="Close recent chats"
                  className="rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {sessions.length === 0 ? (
                  <p className="px-2 py-6 text-center text-sm text-muted">
                    No chats yet. Start a new conversation.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {sessions.map((session) => {
                      const isActive = session.id === activeSessionId
                      return (
                        <li key={session.id}>
                          <button
                            type="button"
                            onClick={() => openSession(session.id)}
                            className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-ink hover:bg-page'
                            }`}
                          >
                            <MessageSquare
                              size={16}
                              className={`mt-0.5 shrink-0 ${isActive ? 'text-primary' : 'text-muted'}`}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">
                                {session.title}
                              </span>
                              <span className="mt-0.5 block text-[11px] text-muted">
                                {formatRelativeTime(session.updatedAt)}
                              </span>
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              <div className="shrink-0 border-t border-line p-3">
                <button
                  type="button"
                  onClick={startNewChat}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
                >
                  <Plus size={16} />
                  Start new chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
