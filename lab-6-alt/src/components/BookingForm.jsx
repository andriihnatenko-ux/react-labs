import { startTransition, useActionState, useRef } from 'react'
import { useFormik } from 'formik'
import GuestsStepper from './GuestsStepper.jsx'
import { sendBooking } from '../api.js'
import { bookingSchema } from '../bookingSchema.js'

const initialValues = {
  name: '',
  phone: '',
  date: '',
  time: '',
  guests: 2,
  comment: '',
}

// Порядок полів для фокуса після невдалого надсилання.
const fieldOrder = ['name', 'phone', 'date', 'time', 'guests', 'comment']

// Після надсилання Formik має показати помилки всіх полів, а не лише тих,
// які людина вже залишила.
const touchedAll = Object.fromEntries(fieldOrder.map((field) => [field, true]))

export default function BookingForm() {
  const nameRef = useRef(null)
  const formik = useFormik({
    initialValues,
    validationSchema: bookingSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: onValid,
  })
  const [result, dispatch, isPending] = useActionState(bookTable, null)

  // Дія для useActionState: null — сигнал «Очистити»; інакше надсилаємо
  // бронювання, після успіху очищаємо форму й повертаємо відповідь.
  async function bookTable(previousResult, booking) {
    if (booking === null) return null
    const response = await sendBooking(booking)
    if (response.ok) startTransition(() => formik.resetForm())
    return response
  }

  function onValid(values) {
    if (isPending) return
    // cast застосовує trim зі схеми — так само, як це робив zodResolver.
    startTransition(() => dispatch(bookingSchema.cast(values)))
  }

  // Formik не переносить фокус сам і не показує помилки полів, яких людина
  // ще не торкалася: після перевірки позначаємо всі поля як «торкнуті»
  // й ставимо курсор у перше поле з помилкою.
  async function handleSubmit(e) {
    e.preventDefault()
    if (isPending) return
    const errors = await formik.validateForm()
    formik.setTouched(touchedAll)
    const first = fieldOrder.find((field) => errors[field])
    if (first) {
      document.querySelector(`[name="${first}"]`)?.focus()
      return
    }
    formik.handleSubmit()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.currentTarget.requestSubmit()
    }
  }

  function handleReset() {
    nameRef.current?.focus()
    formik.resetForm()
    startTransition(() => dispatch(null))
  }

  const showError = (field) =>
    formik.touched[field] && formik.errors[field] ? formik.errors[field] : ''

  return (
    <form
      className="booking-form"
      noValidate
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
    >
      <div className="field">
        <label>
          Ім'я
          <input
            {...formik.getFieldProps('name')}
            ref={nameRef}
            autoComplete="name"
            required
            aria-invalid={showError('name') ? 'true' : 'false'}
            aria-describedby="name-error"
          />
        </label>
        <p id="name-error" className="field-error">
          {showError('name')}
        </p>
      </div>
      <div className="field">
        <label>
          Телефон
          <input
            {...formik.getFieldProps('phone')}
            type="tel"
            autoComplete="tel"
            placeholder="+380671234567"
            required
            aria-invalid={showError('phone') ? 'true' : 'false'}
            aria-describedby="phone-error"
          />
        </label>
        <p id="phone-error" className="field-error">
          {showError('phone')}
        </p>
      </div>
      <div className="row">
        <div className="field">
          <label>
            Дата
            <input
              {...formik.getFieldProps('date')}
              type="date"
              required
              aria-invalid={showError('date') ? 'true' : 'false'}
              aria-describedby="date-error"
            />
          </label>
          <p id="date-error" className="field-error">
            {showError('date')}
          </p>
        </div>
        <div className="field">
          <label>
            Час
            <input
              {...formik.getFieldProps('time')}
              type="time"
              required
              aria-invalid={showError('time') ? 'true' : 'false'}
              aria-describedby="time-error"
            />
          </label>
          <p id="time-error" className="field-error">
            {showError('time')}
          </p>
        </div>
      </div>
      <GuestsStepper
        value={formik.values.guests}
        onChange={(value) => formik.setFieldValue('guests', value)}
      />
      <label>
        Коментар
        <textarea
          {...formik.getFieldProps('comment')}
          maxLength={200}
          aria-describedby="comment-counter"
        />
      </label>
      <p id="comment-counter" className="counter">
        {formik.values.comment.length} / 200
      </p>
      <div className="actions">
        <button type="submit" aria-disabled={isPending}>
          {isPending ? 'Надсилаємо…' : 'Забронювати'}
        </button>
        <button type="button" onClick={handleReset}>
          Очистити
        </button>
      </div>
      <p
        role="status"
        className={result?.ok === false ? 'status error' : 'status'}
      >
        {result?.message}
      </p>
    </form>
  )
}
