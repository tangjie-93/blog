
const fs = require("fs");
const path = require("path")
const join = path.join;
const resolve = path.resolve;
const pathName = "articles"

//创建文件夹和文件的映射
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
                    // const link = getLink(fPath)
                    fileName === "README" ? fileMapObj[curPath].unshift('') : fileMapObj[curPath].push(fileName)
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
function getLink (link) {
    let tempLink = link.replace(/\\/g, "/");
    const index = tempLink.indexOf(pathName);
    tempLink = tempLink.slice(index - 1) + "/";
    return tempLink;
}

function createArticlesNavItem (fileMapObj) {
    let navItem = [];
    Object.keys(fileMapObj).forEach(function (title) {
        let tempTitle = title.replace(/\\/g, "/");
        const index = tempTitle.indexOf(pathName);
        const lastIndex = tempTitle.lastIndexOf("/");
        const link = tempTitle.slice(index - 1) + "/";
        const text = tempTitle.slice(lastIndex + 1);
        navItem.push({ text, link });
    })

    return navItem;
}
function createSideBar (fileMapObj) {
    const sidebar = {};
    Object.keys(fileMapObj).forEach(function (key) {
        const link = getLink(key);
        sidebar[link] = fileMapObj[key];
    })
    return sidebar;
}
const getSidebarMapObject = createSidebarMapObject(pathName)
const sidebar = createSideBar(getSidebarMapObject);
const articlesNavItem = createArticlesNavItem(getSidebarMapObject)
module.exports = {
    base: '/',
    title: '前端技术积累',
    description: "该博客主要是用来记录自己的学习笔记，对自己的学习历程进行一个简单的记录，也会写一些深入总结性的博客。",
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
            { text: '首页', link: '/timeline/' },
            {
                text: '技术栈',
                items: articlesNavItem,
            },
            { text: '关于', link: '/about/' },
            { text: '标签', link: '/tags/' },
            { text: "留言板", link: '/comments/' },
            { text: "充电站", link: "/summarize/" },
            { text: '掘金', link: 'https://juejin.im/user/5bd074165188251ce71d8e2c' },
        ],
        sidebar,
        sidebarDepth: 2,
        // displayAllHeaders: true,
        lastUpdated: 'Last Updated',
        smoothScroll: true
    }
}
