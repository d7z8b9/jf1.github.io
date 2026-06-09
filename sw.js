const CACHE_NAME = 'weight-tracker-v1';
const urlsToCache = [
    './index.html',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js'
];

// 安装事件：缓存核心资源
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('缓存文件');
            return cache.addAll(urlsToCache);
        })
    );
});

// 激活事件：清理旧缓存
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(name) {
                    return name !== CACHE_NAME;
                }).map(function(name) {
                    return caches.delete(name);
                })
            );
        })
    );
});

// 请求拦截：优先使用缓存，实现离线访问
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request).then(function(networkResponse) {
                // 对于成功响应，动态加入缓存
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(function() {
                // 离线时对于非缓存请求可返回自定义离线页，但这里简单返回
                return new Response('离线状态下无法访问该资源', {status: 503});
            });
        })
    );
});