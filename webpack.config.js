const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); //抽离css
const OptimizeCssAssetsWebpackPugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin'); //压缩js
//压缩css optimize-css-assets-webpack-plugin

/*****
 * 1， cleanWebpackPlugin //打包之前清空文件
 * 2， copyWebpackPlugin // 复制文件的插件
 * 3， bannerPlugin // 内置插件 文件头部写注释描述用法
 * 4,  definePlugin // 内置插件 用来配置环境变量是开发还是生产 
 * 5， webpack-merge // 用于拆分webpack.base.js webpack.dev.js webpack.production.js 打包的时候选择哪个配置文件
 * 5,  ignoredPlugin // 忽略引入
 * ******/

/******
 * happypack 多线程打包
 *  抽离公共代码 optimize 配置splitChunks 或者commonChunks
 * 懒加载 使用import 安装babel插件
 * **********/ 

//babel
module.exports = {
    mode: 'development',
    entry: './index.js',
    output: {
        filename: 'bundle.[hash].js',
        path: path.resolve(__dirname, 'dist'),
        //publicPath: 'http://abc.com', //资源路径
    },

    devServer: { //开发服务器配置
        port: 3000,
        // progress: true, //进度条
        contentBase: path.join(__dirname, 'dist'),
        compress: true
    },
    resolve: {  //解析 第三方包
        modules: [],
        extensions: ['.js', '.css', '.json'],
        mainFileds: ["style", "main"],
        //mianFiles: [] 入口文件名字
        // alias: {bootstrap: ''}
    },
    plugins: [ //放所有webpack插件
        new HtmlWebpackPlugin({
            hash: true,
            minify: {
                collapseWhitespace: true,
                removeComments: true
            },
            template: './index.html',
            filename: 'index.html'
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[hash].css',
        }),
    ],
    optimization: { // 优化项
        minimizer: [
          new TerserPlugin({}),
          new OptimizeCssAssetsWebpackPugin({
            assetNameRegExp: /\.css$/g,
            cssProcessor: require('cssnano'),
            cssProcessorOptions: [ 'default', { discardComments: { removeAll: true } }],
            canPrint: true
          }),
        ],
      },
      // 1 source-map增加源码映射 ，出错了会标识错误的正确行和列的文件位置，而不是压缩的位置  会单独生成一个sourcemap映射文件 大而全
      // 2 eval-source-map增加源码映射 ，出错了会标识错误的正确行和列的文件位置，而不是压缩的位置  ***但是不会生成单独映射文件 （生成的关系集成到生成的文件中了）
      // 3 cheap-module-source-map增加源码映射 ，出错了会标识错误的正确行，但是不产生列位置  会生成一个映射文件
      // 4 cheap-module-eval-source-map增加源码映射 ，
      // 出错了会标识错误的正确行，但是不产生列位置  不会生成一个映射文件（生成的关系集成到生成的文件中了）
    devtool: 'source-map', 
    watch: true , // 监控变化实时打包
    watchOptions: { // 监控选项
        poll: 1000, //多久监控一次
        aggregateTimeout: 500, // 防抖
        ignored: /node_modules/ 
    },
    module: {
        noParse: /jquery/, // 不需要解析jquery中的依赖
      rules:  [
         {  //html中使用img 标签引入图片
            test: /\.html$/,
            use: 'html-withimg-loader'
         },
          {
              test: /\.(png|jpg|gif)$/,
              // 做个限制：图片小于多少k时候用base64转化
              //否则用file-loader产生真是的图片
              use: {
                  loader: 'url-loader', //url-loader封装了file-loader,url-loader会将引入的图片编码，生成dataURl
                  //如果图片较大，编码会消耗性能。因此url-loader提供了一个limit参数，小于limit字节的文件会被转为DataURl，
                  //大于limit的还会使用file-loader进行copy
                 options: {
                     limit: 1024,//限制图片大小
                     outputPath: '/img/',
                     //publicPath: 'http://abc.com', //资源路径
                 }
              }
          },
          { 
            test: /\.js$/,
            use: {
                loader: 'eslint-loader',
                options: {
                    enforce: 'pre' //执行顺序
                }
            },
            exclude: /node_modules/,
            include: 'src'
          },
        { //使用babel
            test: /\.js$/,
            use: {  // babel-core的作用在于提供一系列api   webpack使用babel-loader处理文件时，babel-loader实际上调用了babel-core的api
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'], //babel-preset-env的作用是告诉babel使用哪种转码规则进行文件处理
                    plugins: [ //装饰器和类是有顺序的
                        ["@babel/plugin-proposal-decorators", { "legacy": true }],
                        ["@babel/plugin-proposal-class-properties", { "loose" : true }],
                        "@babel/plugin-transform-runtime" // 支持es6 api （这个是api不是语法， babel-loader处理语法）
                      ]
                }
               
                // plugins: [] //es6等高级语法需要的插件
            },
            exclude: /node_modules/
        },  
        {
          // css-loader 负责解析@import 这种语法 (需要安装cssloader，style-loader)
          // style-loader 把css插入到head标签中
          // 多个loader []
          // loader顺序 默认从右往左执行
          //loader 可以写成对象参数形式
            test: /\.css$/, 
            use: [
                // {
                // loader: 'style-loader',  //  对象参数形式，可以配置参数
                // options: {
                //     insertAt: 'top'
                // }
                // },
            MiniCssExtractPlugin.loader, //抽离css
            'css-loader',
            'postcss-loader',
            ] //顺序
        },  
        {
            test: /\.less$/, 
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
                'postcss-loader',
                'less-loader'
            ]
        }
    ]
    }
}

//自动添加浏览器css webkit前缀 实现css3代码补全 使用安装antoprefixer postcss-loader (需要postcss-config.js 配置文件)

// 引入全局变量
// 引用第三方包（类似jquery）

//1， expose-loader 全局loader（{test: require.resolve('jquery'), use: 'expose-loader?$'}）暴露到window
//2,  注入到每个模块，使用webpack插件，插件中写[new webpack.ProvidePlugin({$: jquery})] /**window中没有jQuery对象*/
//3， 使用cdn引入但是不打包，在使用时使用webpack ‘externals：{jquery:$}}’， 不会进行不打包

//webpack打包图片
//1，使用file-loader 默认会在内部生成一个文件，并且返回地址 (处理css和js的图片)
//2，使用html-withimg-loader, 在页面通过img src引入