import { useState } from 'react'

export default function NotifyForm() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [msg, setMsg] = useState('')
  const [status, setStatus] = useState(null)
  const [agree, setAgree] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!agree) return setStatus('Пожалуйста, подтвердите согласие на обработку данных.')

    if (sending) return
    setSending(true)
    setStatus('Отправка...')
    try {
      const res = await fetch('/api/send-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, msg, honeypot }),
      })
      const raw = await res.text()
      let data = null
      try { data = raw ? JSON.parse(raw) : null } catch {}
      if (!res.ok) throw new Error((data && data.error) || raw || 'Ошибка')
      setStatus('Заявка отправлена — я получил уведомление.')
      setName(''); setPhone(''); setMsg('')
    } catch (err) {
      setStatus('Ошибка: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="notify-form">
      <div className="notify-row">
        <span className="notify-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"/></svg>
        </span>
        <input className="notify-input" placeholder="Имя" value={name} onChange={(e)=>setName(e.target.value)} />
      </div>
      <div className="notify-row">
        <span className="notify-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.05-.24c1.12.37 2.33.57 3.54.57a1 1 0 011 1V21a1 1 0 01-1 1C10.07 22 2 13.93 2 3a1 1 0 011-1h3.49a1 1 0 011 1c0 1.21.2 2.42.57 3.54a1 1 0 01-.24 1.05l-2.2 2.2z"/></svg>
        </span>
        <input className="notify-input" placeholder="+380..." value={phone} onChange={(e)=>setPhone(e.target.value)} />
      </div>
      <div className="notify-row">
        <span className="notify-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l9.06-9.06.92.92L5.92 19.58zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.34a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg>
        </span>
        <textarea className="notify-textarea" placeholder="Описание проблемы" value={msg} onChange={(e)=>setMsg(e.target.value)} />
      </div>
      <input className="notify-honeypot" tabIndex="-1" autoComplete="off" value={honeypot} onChange={e=>setHoneypot(e.target.value)} />
      <label className="notify-consent">
        <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} /> Согласен(на) на обработку данных
      </label>
      <button type="submit" className="notify-submit" disabled={sending}>Отправить</button>
      <div className="notify-status">{status}</div>
      <style jsx>{`
        .notify-form { display: flex; flex-direction: column; gap: 12px; max-width: 520px; margin: 0 auto; }
        .notify-row { position: relative; }
        .notify-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: #b3b3b3; pointer-events: none; transition: color .2s ease; display: inline-flex; align-items: center; justify-content: center; }
        .notify-row:focus-within .notify-icon { color: #87ceeb; }
        .notify-input, .notify-textarea { padding: 12px; border: none; border-radius: 8px; font-size: 16px; background: #f9f9f9; outline: none; transition: all .2s ease; }
        .notify-input { padding-left: 52px; }
        .notify-textarea { min-height: 120px; resize: vertical; padding-left: 52px; }
        .notify-input:focus, .notify-textarea:focus { background: #E8F0FE; box-shadow: none; }
        .notify-input::placeholder, .notify-textarea::placeholder { color: #C1C1C1; }
        .notify-consent { display: block; margin-top: 8px; font-family: var(--font-nunito), sans-serif; }
        .notify-submit { color: #fff; font-size: 16px; font-family: var(--font-nunito); font-weight: 500; border: none; border-radius: 8px; letter-spacing: 1px; background-color: rgb(40, 40, 40); cursor: pointer; transition: all .3s ease; height: 55px; box-shadow: 5px 5px 10px rgba(43,43,43,.68); }
        .notify-submit:hover { box-shadow: 5px 5px 15px rgba(43,43,43,.8); transform: translateY(-2px); background-color: #87ceeb; }
        .notify-submit:active { transform: translateY(0); box-shadow: 0 0 8px #87ceeb, 3px 3px 8px rgba(43,43,43,.9); }
        .notify-status { margin-top: 8px; min-height: 20px; }
        .notify-honeypot { display: none; }
        @media (max-width: 767px) { .notify-submit { height: 50px; } }
      `}</style>
    </form>
  )
}
