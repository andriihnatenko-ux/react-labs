export default function Avatar({ person, size = 64 }) {
  return (
    <img
      className="avatar"
      src={person.photo}
      alt={person.name}
      width={size}
      height={size}
      onError={(e) => {
        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="%23e0e0e0"><circle cx="12" cy="12" r="12"/></svg>'
      }}
    />
  )
}