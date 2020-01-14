const fs = require("fs");
const path = require("path")
const join = path.join;
const resolve = path.resolve;
function createSidebarMapObject (dir) {
    let fileMapObj = {};
    const temPath = resolve(__dirname, "..", dir);
    function getAllFiles (curPath) {
        const files = fs.readdirSync(curPath);
        files.forEach(function (file, index) {
            let fPath = join(curPath, file);
            let stat = fs.statSync(fPath);
            if (stat.isDirectory()) {
                fileMapObj[fPath] = [];
                getAllFiles(fPath);
            }
            if (stat.isFile()) {
                const fileObj = path.parse(fPath);
                const fileName = fileObj.name;
                if (Array.isArray(fileMapObj[curPath])) {
                    const link = getLink(fPath)
                    fileMapObj[curPath].push([link, fileName])
                }
                // console.log(fileName);
                // if(typeof fileMapObj[curPath]==='undefined'){
                //     fileMapObj[curPath]=fileName;
                // }else if(Array.isArray(fileMapObj[curPath])){
                //     fileMapObj[curPath].push(fileName)
                // }
            }
        })

    }
    getAllFiles(temPath)
    return fileMapObj;
}
function createSideBar (fileMapObj) {
    const sidebar = [];
    Object.keys(fileMapObj).forEach(function (key) {
        sidebar.push({
            title: getTitle(key),
            children: fileMapObj[key]
        });
    })
    return sidebar;
}
const pathName = "articles"
function getTitle (title) {
    const index = title.lastIndexOf("\\");
    title = title.slice(index + 1);
    return title;
}
function getLink (link) {
    let templink = link.replace(/\\/g, "/");
    const index = templink.indexOf(pathName);
    templink = templink.slice(index - 1);
    return templink;
}
const sidebar = createSideBar(createSidebarMapObject(pathName));

module.exports = {
    base: '/blog/',
    title: '个人博客',
    description: "个人博客",
    markdown: {
        lineNumbers: true // 代码块显示行号
    },
    port: 8002,
    themeConfig: {
        // 你的GitHub仓库，请正确填写
        repo: 'https://github.com/tangjie-93/blog',
        // 自定义仓库链接文字。
        repoLabel: 'GitHub',
        nav: [
            { text: '首页', link: '/' },
            { text: '标签库', link: '/tags/' },
            { text: '关于', link: '/articles/其他/personal.md' },
            { text: '留言板', link: '/massage/' },
            { text: '掘金', link: 'https://juejin.im/user/5bd074165188251ce71d8e2c' },
        ],
        // sidebar,
        sidebarDepth: 2,
        displayAllHeaders: true,
        lastUpdated: 'Last Updated',
        smoothScroll: true,
        plugins: [
            [
                '@vuepress/register-components',
                {
                    componentsDir: './components'
                }
            ]
        ]

    }
}
