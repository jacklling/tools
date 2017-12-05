var ToolsHelper = require("../lib/ToolsHelper.js")

var readpath = "./testdir"
console.log(JSON.stringify(ToolsHelper.getFileListByext(readpath).length, null, 4))
//创建文件夹
ToolsHelper.createdir("C:\\Windows1")
//copy文件夹
ToolsHelper.copydir("./testdir", "./test1")
//读取xml
var data = ToolsHelper.readxml("./testdir/UIPlayerRename.csd", function(err, data){
	// console.log(JSON.stringify(data, null, 4))
	ToolsHelper.writexml("./test.xml", data)
})
//读取xls
var data = ToolsHelper.readxls("./testdir/test.xls")
console.log("data = " + data)
//写入xls
ToolsHelper.writexls(data, "./testxlswrite.xml")
//执行命令
// ToolsHelper.exccommond("TexturePacker ", true)
//删除文件夹下所有的文件夹
ToolsHelper.cleandir("./test1")
//删除文件夹
ToolsHelper.removepath("./test1")
//使用require 读取json
var testjson = require("./testdir/package.json")
if (testjson) {
	console.log("json 存在")
}
