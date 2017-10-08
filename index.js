'use strict'
const fs = require('hexo-fs')

hexo.extend.filter.register('after_render:html', function (str) {
  const identifier = '</body>'
  if (str.indexOf(identifier) !== -1) {
    const script = `<script src="/scripts/hexo-disqus-proxy.js"></script>`
    str = str.replace(identifier, script + identifier)
    str = str.replace(/ +id *= *["']disqus_thread["']/, ' id="disqus_proxy_thread"')
  }
  return str
})

hexo.extend.generator.register('assets', function (locals) {
  const config = hexo.config.disqus_proxy
  const asset = [{
    path: 'scripts/hexo-disqus-proxy.js',
    data: function () {
      return fs.createReadStream('node_modules/hexo-disqus-proxy/lib/hexo-disqus-proxy.js')
    }
  }]
  if (!config.admin_avatar) asset.push({
    path: 'avatars/admin-avatar.jpg',
    data: function () {
      return fs.createReadStream('node_modules/hexo-disqus-proxy/lib/avatars/admin-avatar.jpg')
    }
  })
  if (!config.default_avatar) asset.push({
    path: 'avatars/default-avatar.png',
    data: function () {
      return fs.createReadStream('node_modules/hexo-disqus-proxy/lib/avatars/default-avatar.png')
    }
  })
  return asset
})

hexo.extend.filter.register('template_locals', function (locals) {
  if (!locals.archive && locals.page.source) {
    const config = hexo.config.disqus_proxy
    const script = `
      <script>
        window.disqusProxy={
          shortname: '${config.shortname}',
          server: '${config.host}',
          port: ${config.port},
          defaultAvatar: '${config.default_avatar}',
          adminAvatar: '${config.admin_avatar}',
          identifier: '${locals.path}',
        };
        window.disqus_config = function () {
          this.page.url = window.location.href;
          this.page.identifier = window.disqusProxy.identifier;
        };
      </script>`
    locals.page.content = locals.page.content + script
  }
  return locals
})