export default function Avatar({ user, size = 'md' }) {
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';
  return user?.avatar ? (
    <img className={`avatar avatar-${size}`} src={user.avatar} alt={user.name || 'User'} />
  ) : (
    <div className={`avatar avatar-${size} avatar-fallback`} aria-label={user?.name || 'User'}>{initial}</div>
  );
}
