'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Thread {
  id: string
  name: string
  lastMessage: string
  time: string
  unread: number
  icon: string
  bg: string
  online: boolean
  orderId?: string
  receiverId: string
}

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
}

const MOCK_THREADS: Thread[] = [
  { id: '1', name: 'James Mwangi · Rider', lastMessage: "I'm 2 minutes away, come outside 👋", time: '2m ago', unread: 1, icon: '🏍', bg: '#fff0f2', online: true, receiverId: 'rider-1' },
  { id: '2', name: 'Java House', lastMessage: 'Your order is being prepared ✅', time: '18m ago', unread: 0, icon: '☕', bg: '#fff3e0', online: true, receiverId: 'vendor-1' },
  { id: '3', name: 'Shop Support', lastMessage: "Thanks for your feedback! We've passed it on.", time: 'Yesterday', unread: 0, icon: '🛟', bg: '#e8f5e9', online: false, receiverId: 'support-1' },
  { id: '4', name: 'Naivas Pharmacy', lastMessage: 'Hi! The paracetamol is back in stock 💊', time: 'Mon', unread: 0, icon: '💊', bg: '#e3f2fd', online: false, receiverId: 'vendor-2' },
]

const MOCK_REPLIES: Record<string, string[]> = {
  '1': ['Niko karibu sana! 🏍', 'Nimefika! Niko chini.', 'Asante kwa order! 👋'],
  '2': ['Karibu tena! ☕', 'Enjoy your meal!', 'Asante sana ✅'],
  '3': ['Happy to help! What else can I assist with?', 'We have escalated your issue.', 'Your feedback is valuable to us.'],
  '4': ['Yes, it just arrived! 💊', 'We also have generics available.', 'Feel free to order anytime!'],
}

export default function InboxPage() {
  const [activeThread, setActiveThread] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isOnline, setIsOnline] = useState(true)
  const [typing, setTyping] = useState(false)
  const [replyCount, setReplyCount] = useState<Record<string, number>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  function openThread(thread: Thread) {
    setActiveThread(thread)
    setMessages([
      { id: '1', content: thread.lastMessage, sender_id: thread.receiverId, created_at: new Date(Date.now() - 120000).toISOString() },
    ])
  }

  function sendMessage() {
    if (!input.trim() || !activeThread) return
    if (!isOnline) { toast.error('You are offline'); return }

    const msg: Message = {
      id: Date.now().toString(),
      content: input,
      sender_id: 'me',
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, msg])
    setInput('')
    setTyping(true)

    const count = replyCount[activeThread.id] ?? 0
    const replies = MOCK_REPLIES[activeThread.id] ?? ['Got it!']
    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: replies[count % replies.length],
        sender_id: activeThread.receiverId,
        created_at: new Date().toISOString(),
      }])
      setReplyCount(r => ({ ...r, [activeThread.id]: count + 1 }))
    }, 1500)
  }

  function formatTime(iso: string) {
    const d = new Date(iso)
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  if (activeThread) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Chat topbar */}
        <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-10">
          <button onClick={() => setActiveThread(null)} className="text-lg text-gray-900">←</button>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={{ background: activeThread.bg }}>{activeThread.icon}</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">{activeThread.name}</div>
            <div className={`text-xs font-medium ${isOnline && activeThread.online ? 'text-green-500' : 'text-gray-400'}`}>
              {isOnline && activeThread.online ? '● Online' : '● Offline'}
            </div>
          </div>
          {isOnline && activeThread.online
            ? <a href="tel:+254712345678" className="w-9 h-9 rounded-full bg-green-50 border border-green-300 flex items-center justify-center text-base">📞</a>
            : <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-base opacity-40">📞</div>
          }
        </div>

        {/* Offline banner */}
        {!isOnline && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-700">
            ⚠ You are offline. Go online to send messages and make calls.
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.sender_id === 'me' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                ${msg.sender_id === 'me'
                  ? 'bg-[#FF385C] text-white rounded-br-sm'
                  : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm'}`}>
                {msg.content}
              </div>
              <div className="text-[10px] text-gray-400 mt-1 px-1">{formatTime(msg.created_at)}</div>
            </div>
          ))}
          {typing && (
            <div className="flex items-start">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex gap-1">
                {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-100 px-3 py-2.5 pb-5 flex items-center gap-2.5">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-900 outline-none"
          />
          <button onClick={sendMessage} className="w-9 h-9 rounded-full bg-[#FF385C] flex items-center justify-center text-white text-sm flex-shrink-0">
            ➤
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Topbar */}
      <div className="px-5 pt-4 pb-3 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="flex justify-between items-center mb-3">
          <div className="text-xl font-medium text-gray-900">Inbox</div>
          <button
            onClick={() => setIsOnline(o => !o)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium
              ${isOnline ? 'bg-green-50 border-green-400 text-green-600' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-400">
          <span>⌕</span><span>Search messages...</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-4">
        {['All', 'Orders', 'Riders', 'Support'].map((t, i) => (
          <button key={t} className={`py-2.5 px-3 text-xs font-medium border-b-2 ${i === 0 ? 'text-[#FF385C] border-[#FF385C]' : 'text-gray-400 border-transparent'}`}>{t}</button>
        ))}
      </div>

      {/* Threads */}
      {MOCK_THREADS.map(thread => (
        <button key={thread.id} onClick={() => openThread(thread)} className="w-full flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50 text-left">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ background: thread.bg }}>{thread.icon}</div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline && thread.online ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-sm font-medium text-gray-900">{thread.name}</span>
              <span className="text-[11px] text-gray-400">{thread.time}</span>
            </div>
            <div className={`text-xs truncate ${thread.unread ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{thread.lastMessage}</div>
          </div>
          {thread.unread > 0 && (
            <div className="w-5 h-5 rounded-full bg-[#FF385C] text-white text-[10px] font-medium flex items-center justify-center flex-shrink-0">{thread.unread}</div>
          )}
        </button>
      ))}

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-gray-100 flex py-2.5 pb-4">
        {[['🏠','Home','/customer/home'],['🔍','Explore','/customer/explore'],['🛍','Orders','/customer/orders'],['💬','Inbox',''],['👤','Profile','/customer/profile']].map(([icon,label,href]) => (
          <button key={label} onClick={() => href && router.push(href)} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xl">{icon}</span>
            <span className={`text-[10px] font-medium ${label === 'Inbox' ? 'text-[#FF385C]' : 'text-gray-400'}`}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
