import React, { useState, useEffect } from 'react'

const SellModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: '', phone: '' })
  const [status, setStatus] = useState(null)
  const [honeypot, setHoneypot] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  const closeModal = () => {
    setFormData({ name: '', phone: '' })
    setStatus(null)
    setHoneypot('')
    setSuccess(false)
    onClose()
  }

  const formatUaPhone = (input) => {
    const digits = (input || '').replace(/\D/g, '')
    let rest = digits
    if (rest.startsWith('380')) rest = rest.slice(3)
    else if (rest.startsWith('80')) rest = rest.slice(2)
    else if (rest.startsWith('0')) rest = rest.slice(1)
    return rest.slice(0, 9)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, phone: formatUaPhone(value) }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    const rest = (formData.phone || '').replace(/\D/g, '')
    const isValidPhone = rest.length === 9
    const fullPhone = `+380 ${rest}`
    if (!formData.name.trim() || !isValidPhone) {
      setStatus('Пожалуйста, введите корректный номер в формате +380XXXXXXXXX и заполните все поля')
      return
    }
    if (sending) return
    try {
      setSending(true)
      setStatus('Отправка...')
      const res = await fetch('/api/send-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, phone: fullPhone, msg: 'Заявка на выкуп', honeypot })
      })
      const raw = await res.text()
      let data = null
      try { data = raw ? JSON.parse(raw) : null } catch {}
      if (!res.ok) throw new Error((data && data.error) || raw || 'Ошибка')
      setStatus(null)
      setSuccess(true)
      setTimeout(() => { closeModal() }, 5000)
    } catch (err) {
      setStatus('Ошибка: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Продать стиральную машину</h2>
            <button className="modal-close" onClick={closeModal}>×</button>
          </div>
          <div className="modal-body">
            {success ? (
              <div className="success-view">
                <div className="success-icon">✓</div>
                <h3 className="success-title">Спасибо за обращение!</h3>
                <p className="success-text">Мы получили вашу заявку. Наш менеджер свяжется с вами в ближайшее время.</p>
              </div>
            ) : (
              <>
                <p className="modal-description">
                  Выкуп б/у стиральных машин. Оцениваем справедливо, забираем сами.
                  Оставьте свои контактные данные и наш менеджер свяжется с вами для оценки вашей машины.
                </p>
                <form onSubmit={handleSubmit} className="sell-form">
                  <div className="form-group input-with-icon">
                    <span className="field-icon user-icon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"/></svg>
                    </span>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ваше имя"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group phone-input-group input-with-icon">
                    <span className="field-icon phone-icon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.05-.24c1.12.37 2.33.57 3.54.57a1 1 0 011 1V21a1 1 0 01-1 1C10.07 22 2 13.93 2 3a1 1 0 011-1h3.49a1 1 0 011 1c0 1.21.2 2.42.57 3.54a1 1 0 01-.24 1.05l-2.2 2.2z"/></svg>
                    </span>
                    <span className="phone-prefix">+380</span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      inputMode="numeric"
                      autoComplete="tel"
                      pattern="\d{9}"
                      maxLength={9}
                      className="form-input"
                      required
                    />
                  </div>
                  <input className="honeypot-input" tabIndex="-1" autoComplete="off" value={honeypot} onChange={e=>setHoneypot(e.target.value)} />
                  <div className="submit-wrapper">
                    <button type="submit" className="sell-button">
                      <span>Продать</span>
                    </button>
                  </div>
                  <div className="status-message">{status}</div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: flex-start; align-items: center; z-index: 1000; padding-left: 0; }
        .modal-content { background: white; width: 33.33%; height: 100%; padding: 40px; box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3); display: flex; flex-direction: column; animation: slideInLeft 0.3s ease-out; }
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
        .modal-header h2 { margin: 0; font-size: 18px; font-weight: 400; color: #333; font-family: var(--font-nunito), sans-serif; }
        .modal-close { background: none; border: none; font-size: 30px; cursor: pointer; color: #999; padding: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s ease; }
        .modal-close:hover { background-color: #f5f5f5; color: #333; }
        .modal-body { flex: 1; display: flex; flex-direction: column; }
        .modal-description { font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 40px; font-family: var(--font-nunito), sans-serif; }
        .sell-form { display: flex; flex-direction: column; gap: 25px; flex: 1; }
        .form-group { display: flex; flex-direction: column; }
        .input-with-icon { position: relative; }
        .field-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: #b3b3b3; pointer-events: none; transition: color 0.2s ease; display: inline-flex; align-items: center; justify-content: center; }
        .input-with-icon:focus-within .field-icon { color: #87ceeb; }
        .form-input { padding: 20px; font-size: 18px; border: none; border-radius: 8px; background-color: #f9f9f9; transition: all 0.3s ease; outline: none; font-family: var(--font-nunito), sans-serif; color: #333; }
        .phone-input-group { position: relative; }
        .input-with-icon .form-input { padding-left: 56px; }
        .phone-input-group .form-input { padding-left: 110px; }
        .phone-prefix { position: absolute; top: 50%; left: 54px; transform: translateY(-50%); color: #C1C1C1; font-size: 16px; font-family: var(--font-nunito), sans-serif; pointer-events: none; }
        .phone-input-group:focus-within .phone-prefix { color: #87ceeb; }
        .form-input:focus { background-color: #E8F0FE; box-shadow: none; }
        .form-input:focus::placeholder { color: #87ceeb; }
        .form-input::placeholder { color: #C1C1C1; font-size: 16px; font-family: var(--font-nunito), sans-serif; }
        .sell-button { color: rgb(255, 255, 255); font-size: 16px; font-style: normal; font-family: var(--font-nunito); font-weight: 500; border: none; border-radius: 8px; letter-spacing: 1px; background-color: rgb(40, 40, 40); cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden; width: 100%; height: 60px; max-width: 350px; min-width: 180px; box-shadow: 5px 5px 10px 0px rgba(43, 43, 43, 0.68); }
        .sell-button:hover { box-shadow: 5px 5px 15px 0px rgba(43, 43, 43, 0.8); transform: translateY(-2px); background-color: #87ceeb; }
        .sell-button:active { transform: translateY(0px); box-shadow: 0px 0px 8px 0px #87ceeb, 3px 3px 8px 0px rgba(43, 43, 43, 0.9); }
        .submit-wrapper { margin-top: 20px; display: flex; justify-content: center; }
        .honeypot-input { display: none; }
        .status-message { margin-top: 8px; text-align: center; font-family: var(--font-nunito), sans-serif; color: #333; }
        .success-view { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
        .success-icon { width: 64px; height: 64px; border-radius: 50%; background: #E6F9FE; color: #4EC8ED; display: flex; align-items: center; justify-content: center; font-size: 36px; margin-bottom: 16px; box-shadow: 0 0 0 3px rgba(78,200,237,0.12) inset; }
        .success-title { margin: 0 0 8px; font-size: 22px; font-weight: 600; color: #333; font-family: var(--font-nunito), sans-serif; }
        .success-text { margin: 0 0 20px; font-size: 16px; color: #666; line-height: 1.5; font-family: var(--font-nunito), sans-serif; }
        .success-button { color: #fff; font-size: 16px; font-family: var(--font-nunito); font-weight: 500; border: none; border-radius: 8px; letter-spacing: 1px; background-color: rgb(40, 40, 40); cursor: pointer; transition: all 0.3s ease; height: 55px; padding: 0 22px; box-shadow: 5px 5px 10px rgba(43,43,43,.68); }
        .success-button:hover { box-shadow: 5px 5px 15px rgba(43,43,43,.8); transform: translateY(-2px); background-color: #87ceeb; }
        .success-button:active { transform: translateY(0); box-shadow: 0 0 8px #87ceeb, 3px 3px 8px rgba(43,43,43,.9); }
        @media (max-width: 768px) { .modal-content { width: 90%; height: auto; max-height: 90%; margin: 16px; border-radius: 12px; animation: slideInUp 0.3s ease-out; } @keyframes slideInUp { from { transform: translateY(100%); } to { transform: translateY(0); } } .modal-overlay { justify-content: center; padding: 16px; } .modal-header h2 { font-size: 18px; } .modal-description { font-size: 15px; margin-bottom: 36px; } .sell-form { gap: 21px; } .form-input { padding: 11px; font-size: 15px; } .input-with-icon .form-input { padding-left: 46px; } .phone-input-group .form-input { padding-left: 96px; } .phone-prefix { left: 42px; font-size: 15px; } .form-input::placeholder { font-size: 15px; } .sell-button { height: 50px; font-size: 15px; } .submit-wrapper { margin-top: 16px; } }
      `}</style>
    </>
  )
}

export default SellModal
