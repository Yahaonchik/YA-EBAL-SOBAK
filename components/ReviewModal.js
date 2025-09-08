import React, { useState, useEffect } from 'react'
import OrderButton from './OrderButton'

const ReviewModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: '', review: '', rating: 5 })
  const [hoverRating, setHoverRating] = useState(0)
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
    setFormData({ name: '', phone: '', review: '', rating: 5 })
    setHoverRating(0)
    setStatus(null)
    setHoneypot('')
    setSuccess(false)
    onClose()
  }


  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!formData.name.trim() || !formData.review.trim()) {
      setStatus('Пожалуйста, заполните все обязательные поля')
      return
    }
    if (sending) return
    try {
      setSending(true)
      setStatus('Отправка...')
      const msg = `Отзыв: ${formData.review}\nОценка: ${formData.rating}★`
      const res = await fetch('/api/send-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, msg, honeypot, allowNoPhone: true })
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

  const handleStarClick = (rating) => { setFormData(prev => ({ ...prev, rating })) }
  const handleStarHover = (rating) => { setHoverRating(rating) }
  const handleStarLeave = () => { setHoverRating(0) }

  if (!isOpen) return null

  return (
    <>
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Добавить отзыв</h2>
            <button className="modal-close" onClick={closeModal}>×</button>
          </div>
          <div className="modal-body">
            {success ? (
              <div className="success-view">
                <div className="success-icon">✓</div>
                <h3 className="success-title">Спасибо за отзыв!</h3>
                <p className="success-text">Мы получили ваш отзыв. Он появится на сайте после модерации.</p>
              </div>
            ) : (
              <>
                <p className="modal-description">
                  Поделитесь своим опытом! Ваш отзыв поможет другим клиентам сделать правильный выбор.
                  Расскажите о качестве ремонта и уровне сервиса.
                </p>
                <form onSubmit={handleSubmit} className="review-form">
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
                  <div className="form-group">
                    <label className="rating-label">Оценка:</label>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`star ${star <= (hoverRating || formData.rating) ? 'filled' : ''}`}
                          onClick={() => handleStarClick(star)}
                          onMouseEnter={() => handleStarHover(star)}
                          onMouseLeave={handleStarLeave}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="form-group input-with-icon">
                    <span className="field-icon pencil-icon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l9.06-9.06.92.92L5.92 19.58zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.34a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg>
                    </span>
                    <textarea
                      name="review"
                      value={formData.review}
                      onChange={handleInputChange}
                      placeholder="Напишите ваш отзыв"
                      className="form-textarea"
                      rows="4"
                      required
                    />
                  </div>
                  <input className="honeypot-input" tabIndex="-1" autoComplete="off" value={honeypot} onChange={e=>setHoneypot(e.target.value)} />
                  <div className="submit-wrapper">
                    <OrderButton onClick={handleSubmit} variant="primary" text="Добавить отзыв" />
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
        .review-form { display: flex; flex-direction: column; gap: 25px; flex: 1; }
        .form-group { display: flex; flex-direction: column; }
        .input-with-icon { position: relative; }
        .field-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: #b3b3b3; pointer-events: none; transition: color 0.2s ease; display: inline-flex; align-items: center; justify-content: center; }
        .input-with-icon:focus-within .field-icon { color: #87ceeb; }
        .rating-label { font-size: 16px; font-weight: 500; margin-bottom: 5px; color: #333; font-family: var(--font-nunito), sans-serif; }
        .star-rating { display: flex; gap: 5px; }
        .star { font-size: 30px; cursor: pointer; color: #ddd; transition: all 0.3s ease; user-select: none; }
        .star:hover { transform: scale(1.1); }
        .star.filled { color: #5FCDEE; }
        .form-input { padding: 20px; font-size: 18px; border: none; border-radius: 8px; background-color: #f9f9f9; transition: background-color 0.2s ease; outline: none; font-family: var(--font-nunito), sans-serif; color: #333; }
        .phone-input-group { position: relative; }
        .input-with-icon .form-input { padding-left: 56px; }
        .input-with-icon .form-textarea { padding-left: 56px; }
        .phone-input-group .form-input { padding-left: 110px; }
        .phone-prefix { position: absolute; top: 50%; left: 54px; transform: translateY(-50%); color: #C1C1C1; font-size: 16px; font-family: var(--font-nunito), sans-serif; pointer-events: none; }
        .phone-input-group:focus-within .phone-prefix { color: #87ceeb; }
        .form-textarea { padding: 20px; font-size: 18px; border: none; border-radius: 8px; background-color: #f9f9f9; transition: background-color 0.2s ease; outline: none; resize: none; min-height: 120px; font-family: var(--font-nunito), sans-serif; color: #333; }
        .form-input:focus, .form-textarea:focus { background-color: #E8F0FE; box-shadow: none; }
        .form-input:focus::placeholder, .form-textarea:focus::placeholder { color: #87ceeb; }
        .pencil-icon { top: 20px; transform: none; }
        .form-input::placeholder, .form-textarea::placeholder { color: #C1C1C1; font-size: 16px; font-family: var(--font-nunito), sans-serif; }
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
        @media (max-width: 768px) { .modal-content { width: 90%; height: auto; max-height: 90%; margin: 16px; padding: 20px; border-radius: 12px; animation: slideInUp 0.3s ease-out; } @keyframes slideInUp { from { transform: translateY(100%); } to { transform: translateY(0); } } .modal-overlay { justify-content: center; padding: 10px; } .modal-header { margin-bottom: 15px; padding-bottom: 15px; } .modal-header h2 { font-size: 18px; } .modal-description { font-size: 15px; margin-bottom: 15px; } .review-form { gap: 12px; } .form-input, .form-textarea { padding: 11px; font-size: 15px; } .input-with-icon .form-input, .input-with-icon .form-textarea { padding-left: 46px; } .phone-input-group .form-input { padding-left: 96px; } .phone-prefix { left: 42px; font-size: 15px; } .form-input::placeholder, .form-textarea::placeholder { font-size: 15px; } .submit-wrapper { margin-top: 10px; } .pencil-icon { top: 14px; } }
      `}</style>
    </>
  )
}

export default ReviewModal
