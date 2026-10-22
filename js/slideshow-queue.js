function uploadOrder(a, b) {
  return (Date.parse(a.uploadedAt) || 0) - (Date.parse(b.uploadedAt) || 0) || a.key.localeCompare(b.key);
}

export class PhotoQueue {
  oldQueue = [];
  newQueue = [];
  known = new Set();
  initialized = false;
  current = null;

  sync(items) {
    const photos = [...items].sort(uploadOrder);
    const live = new Set(photos.map(photo => photo.key));
    this.oldQueue = this.oldQueue.filter(photo => live.has(photo.key));
    this.newQueue = this.newQueue.filter(photo => live.has(photo.key));
    if (!this.initialized) {
      this.oldQueue = photos;
      this.initialized = true;
    } else {
      this.newQueue.push(...photos.filter(photo => !this.known.has(photo.key)));
    }
    this.known = live;
    if (this.current && !live.has(this.current.key)) this.current = null;
    if (!this.current) this.next();
    return this.current;
  }

  next() {
    const item = this.newQueue.length ? this.newQueue.shift() : this.oldQueue.shift();
    if (item) this.oldQueue.push(item);
    this.current = item || null;
    return this.current;
  }
}
