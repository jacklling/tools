var ToolsHelper = require("../lib/ToolsHelper.js")
var Path = require("path")

// 文件操作区域测试
var readpath = "./testdir/filepath"
var filelist = ToolsHelper.getFileListByext(readpath)
console.log("测试目录:" + readpath)
console.log("文件个数:" + filelist.length)

var pathcreate = "./testdir/filepathtest/testpath"
console.log("测试创建文件夹:" + pathcreate)
ToolsHelper.createdir(pathcreate)
console.log("创建文件夹成功")
console.log("ceshi 拷贝文件夹" + readpath + "==>" + pathcreate)
ToolsHelper.copydir(readpath, pathcreate)

console.log("测试读取XML")
ToolsHelper.readxml(Path.join(readpath, "UIPlayerRename.csd"), function(err, data){
	// console.log(JSON.stringify(data, null, 4))
	if (data){
		console.log("读取xml成功")
	}
	ToolsHelper.writexml(Path.join(pathcreate, "test.xml"), data)
	console.log("写入xml成功")
})

//读取xls
console.log("读取xls====》")
var data = ToolsHelper.readxls(Path.join(readpath, "test.xls"))
console.log("data = " + data)
//写入xls
var writepath = "./testxlswrite.xls"
ToolsHelper.writexls(data, writepath)
console.log("写入xls成功")
console.log("删除文件")
ToolsHelper.removepath(writepath)
//删除文件夹下所有的文件夹
console.log("删除文件夹下所有文件：" + pathcreate)
ToolsHelper.cleandir(pathcreate)
//删除文件夹
console.log("删除文件夹" + pathcreate)
ToolsHelper.removepath(pathcreate)


//执行命令
ToolsHelper.exccommond(["cd ../ ", "cd ./tools"], true)