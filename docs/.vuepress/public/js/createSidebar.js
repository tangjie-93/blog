const fs = require("fs");
const path = require("path")
const join = path.join;
const resolve = path.resolve;
const pathName = "articles"
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
module.exports={
    createSidebarMapObject,createSideBar
}
