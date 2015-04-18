FBuild - 自动化构建工具
========================

- 支持按目录打包
- 支持less自动编译
- html模板编译成 AMD 规则的包
- 加入雪碧图生成

### 快速开始

#### 安装并初始化目录结构

```bash
sudo npm install fbuild -g
cd [目录]
fbuild init 
```

#### 初始化一个包 'hello'

```bash
fbuild init.pack hello
```
##### 初始化 1.0.2 的包 'hello'

```bash
fbuild init.pack hello 1.0.2
```

#### 开启自动构建监视

```bash
fbuild
```

#### 单独构建雪碧图

```bash
cd [png目录]
fbuild sp out=../img less=../less
```

#### fbuild 目录结构是这样的

```
|- static
  |- js
    |- fbuild.json #fbuild 的配置文件
    |- config.js #根据构建的内容，自动生成配置
    |- config.dev.js #根据构建的内容，自动生成配置, dev 环境
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

#### 配置文件, 默认调用的包版本

> !!默认!! 最后编辑那个版本，就用那个版本

如需要指定版本，请编辑 fbuild.json

```js
{
    "//": "指定包的版本,注：如果没有指定，修改那个版本，就使用那个版本",
    "packVersion": {
        "packName": "1.0.4"
    }

}
```

#### 升级fbuild

```bash
sudo npm update -g fbuild
```


