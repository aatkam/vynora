export function timeAgo(value) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  const ranges = [
    ['y', 31536000],
    ['mo', 2592000],
    ['d', 86400],
    ['h', 3600],
    ['m', 60]
  ];
  for (const [label, size] of ranges) {
    if (seconds >= size) return `${Math.floor(seconds / size)}${label}`;
  }
  return 'now';
}

export function notificationText(type) {
  if (type === 'follow') return 'started following you';
  if (type === 'comment') return 'commented on your post';
  return 'liked your post';
}
