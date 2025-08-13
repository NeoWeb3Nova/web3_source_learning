const CACHE_NAME = 'web3-defi-vocab-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // 这些文件会在构建时自动添加
];

// 需要缓存的动态资源模式
const CACHE_PATTERNS = [
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/,
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /\.(?:js|css)$/,
];

// 检查是否为开发环境
const isDevelopment = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

if (isDevelopment) {
  console.log('Service Worker: Skipping in development mode');
  // 在开发环境中不执行任何缓存操作
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', () => self.clients.claim());
  self.addEventListener('fetch', (event) => {
    // 在开发环境中直接通过网络获取资源
    event.respondWith(fetch(event.request));
  });
} else {
  // 生产环境的服务工作者逻辑
  
// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非GET请求
  if (request.method !== 'GET') {
    return;
  }

  // 跳过Chrome扩展请求
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // 如果有缓存，返回缓存
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', request.url);
          return cachedResponse;
        }

        // 网络请求
        return fetch(request)
          .then((response) => {
            // 检查响应是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 检查是否需要缓存
            const shouldCache = CACHE_PATTERNS.some(pattern => 
              pattern.test(request.url)
            );

            if (shouldCache) {
              const responseToCache = response.clone();
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  console.log('Service Worker: Caching dynamic resource', request.url);
                  cache.put(request, responseToCache);
                });
            }

            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed', error);
            
            // 如果是导航请求且网络失败，返回离线页面
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            // 对于其他资源，可以返回默认的离线资源
            if (request.destination === 'image') {
              return caches.match('/icons/icon-192x192.png');
            }
            
            throw error;
          });
      })
  );
});

// 后台同步
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 这里可以添加后台同步逻辑
      // 比如同步用户的学习进度数据
      syncUserProgress()
    );
  }
});

// 推送通知
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received', event);
  
  const options = {
    body: event.data ? event.data.text() : '您有新的学习提醒！',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '开始学习',
        icon: '/icons/action-study.png'
      },
      {
        action: 'close',
        title: '稍后提醒',
        icon: '/icons/action-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Web3.0 DeFi词汇大作战', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click', event);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // 设置稍后提醒
    console.log('User chose to be reminded later');
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 同步用户进度的函数
async function syncUserProgress() {
  try {
    // 获取本地存储的进度数据
    const progressData = await getStoredProgressData();
    
    if (progressData && progressData.needsSync) {
      // 这里可以添加与服务器同步的逻辑
      console.log('Service Worker: Syncing user progress', progressData);
      
      // 模拟同步成功
      await markProgressAsSynced();
    }
  } catch (error) {
    console.error('Service Worker: Failed to sync progress', error);
  }
}

// 获取存储的进度数据（模拟函数）
async function getStoredProgressData() {
  // 这里应该从IndexedDB或其他存储中获取数据
  return null;
}

// 标记进度为已同步（模拟函数）
async function markProgressAsSynced() {
  // 这里应该更新本地存储的同步状态
  console.log('Progress marked as synced');
}

} // 结束生产环境逻辑