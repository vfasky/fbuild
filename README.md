FBuild - 自动化构建工具
========================

- 支持按目录打包
- 支持less自动编译
- html模板编译成 AMD 规则的包

### 快速开始

#### 安装并初始化目录结构

```bash
npm install fbuild
gulp init --path=../static
```

#### 初始化一个包 'hello'

```bash
gulp init.pack --path=../static/js/pack/hello
```

#### 开启自动构建监视

```bash
gulp --path=../static
```

#### 向包 'hello' 添加内容

```bash
vim ../static/js/pack/hello/src/word.js
vim ../static/js/pack/hello/src/index.js
```

#### 保存后，目录结构是这样的

```
|- static
  |- js
    |- config.js #根据构建的内容，自动生成配置
    |- pack
      |- hello
        |- dist
          |- hello.all.js #自动合并
          |- hello.min.xxxxxx.js #压缩并根据内容hash文件名
        |- src
          |- index.js
          |- word.js

```

### 目录结构约定

#### 模板约定

> define('tpl/*') 为保留前缀，所有自动生成的模板，
> 使用该规则，生成 AMD 规则的model

```
|- [static]
  |- tpl #模板根目录
    |- pack #模板所在的包，对应 defind('tpl/pack')
      |- index.html
      |- test.html
```

这时，调用 tpl/pack/test.html 的内容，只需执行

```js
require(['tpl/pack'], function(pack){
    console.log(pack['test.html']);
});
```

#### less 约定

```
|- [static]
  |- style
    |- less #less源文件存放目录
    |- css #编译后的文件存放目录
```
