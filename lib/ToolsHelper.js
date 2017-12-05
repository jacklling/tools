var fs = require("fs") //系统
var commander = require("commander")//系统
var child_process = require("child_process") //系统
var Path = require("path")//系统
var util = require('util');//系统
var os = require("os")//系统

var xml2js = require("xml2js") //三方
var _ = require('underscore');//三方
var crc = require('crc')//三方
var async = require("async")//三方
var shelljs = require('shelljs')//三方
var xlsx = require("node-xlsx")//三方
var yargs = require('yargs')//三方
var bl = require("bl")//三方
var chalk = require("chalk")//彩色输出 //三方
var opn = require('opn')//三方
var thunderVip = require('thunder-vip');//三方
var minimatch = require('minimatch');//三方
var md5 = require('md5');//三方
var tar = require('tar');//三方
var fsextra = require("fs-extra")//三方
var mysql = require("mysql")//三方
var handlebars = require("handlebars")//三方
var Sep = Path.sep
var md5 = require("md5")

//设置平台不相干的文件
var notcheckfile = [
	".DS_Store",// mac文件
	".meta",// 记录文件
]

var isaddin = function(filepath){
	var flag = true
	_.forEach(notcheckfile, function(extname){
		if (filepath.indexOf(extname) != -1){
			flag = false
		}
	})
	return flag
}

//文件后缀名匹配规则
var isextaddin = function(fullpath, extname){
	if(!extname || fullpath.indexOf(extname) != -1){
		return true 
	}
	return false
}


var ToolsHelper = {
	ispathexit:function(path, isthrow){
		if (fs.existsSync(path)){
			return true
		}
		if (isthrow){
			throw(new Error("文件不存在:" + path))
		}
		return false
	},

	//根据后缀名获取文件
	getFileListByext:function(path, extlist){
		if (_.isString(extlist)){
			extlist = [extlist]
		}else if(_.isArray(extlist)){
			extlist = extlist
		} else {
			console.log("默认获取所有文件")
			extlist = []
		}

		var filelist = []
		if (extlist.length == 0){
			this.readpath(path, filelist, extlist, null)
		}else{
			_.forEach(extlist, function(extname){
				var list = []
				this.readpath(path, list, extname)
				filelist = filelist.concat(list)
			}, this)
		}

		return filelist
	},

	readpath:function(path, filelist, extname,dirlist){
		var self = this
		var files = fs.readdirSync(path)
		files.forEach(walk);
		function walk(file){
			var fullpath = Path.join(path, file)
			var states = self.getfilestates(fullpath)
			var obj = {}

			obj.path = fullpath;
			obj.pathonly = Path.dirname(fullpath);
			obj.ext = Path.extname(fullpath);
			obj.path = fullpath;
			obj.name = Path.basename(fullpath);
			obj.nameonly = Path.basename(fullpath, states.ext)

			obj.states = states
			if(states.isDirectory()){
				dirlist && dirlist.push(obj)
				self.readpath(fullpath, filelist, extname, dirlist)
			}else {

				if (isaddin(fullpath)){
					//再检验自己的文件的规则
					if (isextaddin(fullpath, extname)){
						filelist && filelist.push(obj)
					}
				}
			}
		}
	},
	//获取文件stat
	getfilestates:function(path){
		this.ispathexit(path, true)
		var ret = {}
		if (fs.existsSync(path)){
			ret = fs.statSync(path)
		}
		return ret
	},
	//所有的都将认为是路径 ps 其他盘符的路径也会被创建
	createdir:function(dirpath){
		var realpath = dirpath.split(/[/\\]/g)
		var pathcreate = ""
		_.forEach(realpath, function(str){
			pathcreate = pathcreate + str
			if (pathcreate.indexOf(":") != pathcreate.length - 1){
				if (!fs.existsSync(pathcreate)){
					fs.mkdirSync(pathcreate)
				}
			}
			pathcreate = pathcreate + Sep
		})
	},
	//写入一个文件
	writefile:function(path, content){
		if (!_.isString(path)){
			throw(new Error("path 必须是一个字符串路径"))
			return
		}
		content = content || ""
		if (!_.isString(content)){
			content = JSON.stringify(content, null, 4)
		}
		var dirname = Path.dirname(path)
		this.createdir(dirname)
		fs.writeFileSync(path, content)
	},
	//读取文件
	readfile:function(path){
		this.ispathexit(path, true)
		return fs.readFileSync(path)
	},
	//获取文件的md5码
	getfilemd5:function(path, callback){
		this.ispathexit(path, true)
		return md5(fs.readFileSync(path))
	},
	//拷贝文件
	copyfile:function(from, to){
		this.ispathexit(from, true)

		var todir = Path.dirname(to)
		this.createdir(todir)
		fsextra.copySync(from, to)
	},
	//创建并删除某个目录下的所有文件
	cleandir:function(path){
		this.createdir(path)
		fsextra.emptyDir(path)
	},

	//把某个文件夹下的文件，copy到某个目录 不关心子目录
	copyfiletodir:function(copypath, writepath, copyfiliter){
		this.ispathexit(copypath, true)
		this.createdir(writepath)
		var filelist = this.getFileListByext(copypath, copyfiliter)
		_.forEach(filelist, function(pathobj){
			this.copyfile(pathobj.path, Path.join(writepath, pathobj.name))
		}, this)
	},
	//关系子目录的拷贝
	copydir:function(copypath, writepath, copyfiliter){
		this.ispathexit(copypath, true)
		this.createdir(writepath)
		var filelist = this.getFileListByext(copypath, copyfiliter)
		_.forEach(filelist, function(pathobj){
			var lastpath = Path.relative(copypath, pathobj.path)
			this.copyfile(pathobj.path, Path.join(writepath, lastpath))
		}, this)
	},
	//删除文件夹或者文件
	removepath:function(path){
		fsextra.removeSync(path)
	},
	//执行命令行
	exccommond:function(command, isshowlog, callback){
		if (isshowlog != false ){
			isshowlog = true
		}
		command = command || ""
		if (_.isString(command)){
			command = [command]
		}

		if (!_.isArray(command)){
			callback && callback();
			return
		}
		var iscallback = true

		var child_process1 = require("child_process")

		var child = child_process1.exec(command.join("&&"));
		child.stdout.on('data', function(data){
			isshowlog && console.log(data)
		})

		child.stderr.on('data', function(data){
			throw(new Error("执行出错:" + data))
			iscallback = false
		})

		child.on('exit', function(code){
			isshowlog && console.log("执行完毕====>" + code)
			iscallback && callback && callback()
		})
	},
	//读取xls
	readxls:function(path){
		this.ispathexit(path, true)
		var data = xlsx.parse(fs.readFileSync(path))
		// console.log(JSON.stringify(data, null, 4 ))
		return data
	},
	//data = [{name: "mySheetName", data: [[a,b,c],[1,2,3]]}] //不检查data的有效性
	writexls:function(data, xlsxname){
		var buffer = xlsx.build(data);
		this.writefile(xlsxname, buffer)
	},
	//异步转换
	readxml:function(path, callback){
		this.ispathexit(path, true)
        xml2js.parseString( this.readfile(path), {explicitArray: false}, function (err, json) {
            callback && callback(err, json)
        });
	},
	writexml:function(writepath, jsonobj){
        var builder = new xml2js.Builder();
        if(!jsonobj){
        	throw(new Error("jsonobj 不存在"))
        }
        var xml = builder.buildObject(jsonobj);
        if (!xml){
        	throw(new Error("转换成xml失败"))
        }
        // console.log("==============================?" + writepath)
        this.writefile(writepath, xml)
	},
	////读取plist文件 实际上还是xml
	readplist:function(path,callback){
		return this.readxml(path,callback)
	}

}

module.exports = ToolsHelper

