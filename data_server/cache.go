package main

import (
	"container/list"
	"sync"
	"time"
)

const (
	maxCacheBytes = 150 * 1024 * 1024 // 150 MB
	cacheTTL      = 2 * time.Hour
)

type cacheEntry struct {
	key     string
	data    []byte
	expires time.Time
}

// byteCache is a thread-safe byte-aware LRU cache with per-entry TTL.
// Evicts the least-recently-used entry when the total byte budget is exceeded.
type byteCache struct {
	mu       sync.Mutex
	ll       *list.List
	items    map[string]*list.Element
	size     int64
	maxBytes int64
	ttl      time.Duration
}

func newByteCache(maxBytes int64, ttl time.Duration) *byteCache {
	return &byteCache{
		ll:       list.New(),
		items:    make(map[string]*list.Element),
		maxBytes: maxBytes,
		ttl:      ttl,
	}
}

func (c *byteCache) get(key string) ([]byte, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	el, ok := c.items[key]
	if !ok {
		return nil, false
	}
	entry := el.Value.(*cacheEntry)
	if time.Now().After(entry.expires) {
		c.removeElement(el)
		return nil, false
	}
	c.ll.MoveToFront(el)
	return entry.data, true
}

func (c *byteCache) set(key string, data []byte) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if el, ok := c.items[key]; ok {
		c.ll.MoveToFront(el)
		entry := el.Value.(*cacheEntry)
		c.size -= int64(len(entry.data))
		entry.data = data
		entry.expires = time.Now().Add(c.ttl)
		c.size += int64(len(data))
		return
	}
	entry := &cacheEntry{key: key, data: data, expires: time.Now().Add(c.ttl)}
	el := c.ll.PushFront(entry)
	c.items[key] = el
	c.size += int64(len(data))
	for c.size > c.maxBytes && c.ll.Len() > 0 {
		c.removeElement(c.ll.Back())
	}
}

func (c *byteCache) removeElement(el *list.Element) {
	c.ll.Remove(el)
	entry := el.Value.(*cacheEntry)
	delete(c.items, entry.key)
	c.size -= int64(len(entry.data))
}
