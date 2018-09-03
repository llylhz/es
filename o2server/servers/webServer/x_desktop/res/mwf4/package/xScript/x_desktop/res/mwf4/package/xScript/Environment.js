MWF.xScript = MWF.xScript || {};
MWF.xScript.Environment = function(ev){
    var _data = ev.data;
    var _form = ev.form;
    var _forms = ev.forms;

    this.library = COMMON;
    //this.library.version = "4.0";

    //data
    var getJSONData = function(jData){
        return new MWF.xScript.JSONData(jData, function(data, key, _self){
            var p = {"getKey": function(){return key;}, "getParent": function(){return _self;}};
            while (p && !_forms[p.getKey()]) p = p.getParent();
            if (p) if (p.getKey()) if (_forms[p.getKey()]) _forms[p.getKey()].resetData();
        });
    };
    this.setData = function(data){
        this.data = getJSONData(data);
        this.data.save = function(callback){
            form.workAction.saveData(function(){if (callback) callback();}.bind(this), null, work.id, jData);
        }
    };
    this.setData(_data);
    //task
    //this.task = ev.task;
    //this.task.process = function(routeName, opinion, callback){
    //    _form.submitWork(routeName, opinion, callback);
    //};
    //inquiredRouteList
    //this.inquiredRouteList = null;

    //workContext

    this.workContext = {
        "getTask": function(){return ev.task;},
        "getWork": function(){return ev.work || ev.workCompleted;},
        "getActivity": function(){return ev.activity;},
        "getTaskList": function(){return ev.taskList;},
        "getReadList": function(){return ev.readList;},
        "getTaskCompletedList": function(){return ev.taskCompletedList;},
        "getControl": function(){return ev.control;},
        "getWorkLogList": function(){return ev.workLogList;},
        "getAttachmentList": function(){return ev.attachmentList;},
        "getRouteList": function(){return (ev.task) ? ev.task.routeNameList: null;},
        "getInquiredRouteList": function(){return null;},
        "setTitle": function(title){
            if (!this.workAction){
                MWF.require("MWF.xScript.Actions.WorkActions", null, false);
                this.workAction = new MWF.xScript.Actions.WorkActions();
            }
            this.workAction.setTitle(ev.work.id, {"title": title});
        }
    };
    this.workContent = this.workContext;
    var _redefineWorkProperties = function(work){
        if (work){
            work.creatorPersonDn = work.creatorPerson;
            work.creatorUnitDn = work.creatorUnit;
            work.creatorUnitDnList = work.creatorUnitList;
            work.creatorIdentityDn = work.creatorIdentity;
            var o = {
                "creatorPerson": {"get": function(){return this.creatorPersonDn.substring(0, this.creatorPersonDn.indexOf("@"));}},
                "creatorUnit": {"get": function(){return this.creatorUnitDn.substring(0, this.creatorUnitDn.indexOf("@"));}},
                "creatorDepartment": {"get": function(){return this.creatorUnitDn.substring(0, this.creatorUnitDn.indexOf("@"));}},
                "creatorIdentity": {"get": function(){return this.creatorIdentityDn.substring(0, this.creatorIdentityDn.indexOf("@"));}},
                // "creatorUnitList": {
                //     "get": function(){
                //         var v = [];
                //         this.creatorUnitDnList.each(function(dn){
                //             v.push(dn.substring(0, dn.indexOf("@")))
                //         });
                //         return v;
                //     }
                // },
                "creatorCompany": {"get": function(){
                    if (this.creatorUnitLevel){
                        var level = this.creatorUnitLevel.split("/");
                        return level[0];
                    }else{
                        return this.creatorUnitDn.substring(0, this.creatorUnitDn.indexOf("@"));
                    }
                }}
            };
            MWF.defineProperties(work, o);
        }
        return work;
    };
    var _redefineTaskProperties = function(task){
        if (task){
            task.personDn = task.person;
            task.unitDn = task.unit;
            task.unitDnList = task.unitList;
            task.identityDn = task.identity;
            var o = {
                "person": {"get": function(){return this.personDn.substring(0, this.personDn.indexOf("@"));}},
                "unit": {"get": function(){return this.unitDn.substring(0, this.unitDn.indexOf("@"));}},
                "department": {"get": function(){return this.unitDn.substring(0, this.unitDn.indexOf("@"));}},
                "identity": {"get": function(){return this.identityDn.substring(0, this.identityDn.indexOf("@"));}},
                // "unitList": {
                //     "get": function(){
                //         var v = [];
                //         this.unitDnList.each(function(dn){
                //             v.push(dn.substring(0, dn.indexOf("@")))
                //         });
                //         return v;
                //     }
                // },
                "company": {"get": function(){return this.unitList[0];}}
            };
            MWF.defineProperties(task, o);
        }
        return task;
    };
    _redefineWorkProperties(this.workContext.getWork());
    _redefineTaskProperties(_redefineWorkProperties(this.workContext.getTask()));


    //dict
    this.Dict = MWF.xScript.createDict(_form.json.application);

    //unit
    var orgActions = null;
    var getOrgActions = function(){
        // if (!orgActions){
        //     MWF.xDesktop.requireApp("Org", "Actions.RestActions", null, false);
        //     orgActions = new MWF.xApplication.Org.Actions.RestActions ();
        // }
        if (!orgActions){
            MWF.require("MWF.xScript.Actions.UnitActions", null, false);
            orgActions = new MWF.xScript.Actions.UnitActions();
        }
    };
    var getNameFlag = function(name){
        var t = typeOf(name);
        if (t==="array"){
            var v = [];
            name.each(function(id){
                v.push((typeOf(id)==="object") ? (id.distinguishedName || id.id || id.unique || id.name) : id);
            });
            return v;
        }else{
            return [(t==="object") ? (name.distinguishedName || name.id || name.unique || name.name) : name];
        }
    };
    this.org = {
        //群组***************
        //获取群组--返回群组的对象数组
        getGroup: function(name){
            getOrgActions();
            var data = {"groupList": getNameFlag(name)};
            var v = null;
            orgActions.listGroup(data, function(json){v = json.data;}, null, false);
            return (v && v.length===1) ? v[0] : v;
        },
        //查询下级群组--返回群组的对象数组
        //nested  布尔  true嵌套下级；false直接下级；默认false；
        listSubGroup: function(name, nested){
            getOrgActions();
            var data = {"groupList": getNameFlag(name)};
            var v = null;
            if (nested){
                orgActions.listSubGroupNested(data, function(json){v = json.data;}, null, false);
            }else{
                orgActions.listSubGroupDirect(data, function(json){v = json.data;}, null, false);
            }
            return v;
        },
        //查询上级群组--返回群组的对象数组
        //nested  布尔  true嵌套上级；false直接上级；默认false；
        listSupGroup:function(name, nested){
            getOrgActions();
            var data = {"groupList": getNameFlag(name)};
            var v = null;
            if (nested){
                orgActions.listSupGroupNested(data, function(json){v = json.data;}, null, false);
            }else{
                orgActions.listSupGroupDirect(data, function(json){v = json.data;}, null, false);
            }
            return v;
        },
        //人员所在群组（嵌套）--返回群组的对象数组
        listGroupWithPerson:function(name){
            getOrgActions();
            var data = {"personList": getNameFlag(name)};
            var v = null;
            orgActions.listGroupWithPerson(data, function(json){v = json.data;}, null, false);
            return v;
        },
        //群组是否拥有角色--返回true, false
        groupHasRole: function(name, role){
            getOrgActions();
            nameFlag = (typeOf(name)==="object") ? (name.distinguishedName || name.id || name.unique || name.name) : name;
            var data = {"group":nameFlag,"roleList":getNameFlag(role)};
            var v = false;
            orgActions.groupHasRole(data, function(json){v = json.data.value;}, null, false);
            return v;
        },

        //角色***************
        //获取角色--返回角色的对象数组
        getRole: function(name){
            getOrgActions();
            var data = {"roleList": getNameFlag(name)};
            var v = null;
            orgActions.listRole(data, function(json){v = json.data;}, null, false);
            return (v && v.length===1) ? v[0] : v;
        },
        //人员所有角色（嵌套）--返回角色的对象数组
        listRoleWithPerson:function(name){
            getOrgActions();
            var data = {"personList": getNameFlag(name)};
            var v = null;
            orgActions.listRoleWithPerson(data, function(json){v = json.data;}, null, false);
            return v;
        },

        //人员***************
        //人员是否拥有角色--返回true, false
        personHasRole: function(name, role){
            getOrgActions();
            nameFlag = (typeOf(name)==="object") ? (name.distinguishedName || name.id || name.unique || name.name) : name;
            var data = {"person":nameFlag,"roleList":getNameFlag(role)};
            var v = false;
            orgActions.personHasRole(data, function(json){v = json.data.value;}, null, false);
            return v;
        },
        //获取人员--返回人员的对象数组
        getPerson: function(name){
            getOrgActions();
            var data = {"personList": getNameFlag(name)};
            var v = null;
            orgActions.listPerson(data, function(json){v = json.data;}, null, false);
            return (v && v.length===1) ? v[0] : v;;
        },
        //查询下级人员--返回人员的对象数组
        //nested  布尔  true嵌套下级；false直接下级；默认false；
        listSubPerson: function(name, nested){
            getOrgActions();
            var data = {"personList": getNameFlag(name)};
            var v = null;
            if (nested){
                orgActions.listPersonSubNested(data, function(json){v = json.data;}, null, false);
            }else{
                orgActions.listPersonSubDirect(data, function(json){v = json.data;}, null, false);
            }
            return v;
        },
        //查询上级人员--返回人员的对象数组
        //nested  布尔  true嵌套上级；false直接上级；默认false；
        listSupPerson: function(name, nested){
            getOrgActions();
            var data = {"personList": getNameFlag(name)};
            var v = null;
            if (nested){
                orgActions.listPersonSupNested(data, function(json){v = json.data;}, null, false);
            }else{
                orgActions.listPersonSupDirect(data, function(json){v = json.data;}, null, false);
            }
            return v;
        },
        //获取群组的所有人员--返回人员的对象数组
        listPersonWithGroup: function(name){
            getOrgActions();
            var data = {"groupList": getNameFlag(name)};
            var v = null;
            orgActions.listPersonWithGroup(data, function(json){v = json.data;}, null, false);
            return v;
        },
        //获取角色的所有人员--返回人员的对象数组
        listPersonWithRole: function(name){
            getOrgActions();
            var data = {"roleList": getNameFlag(name)};
            var v = null;
            orgActions.listPersonWithRole(data, function(json){v = json.data;}, null, false);
            return v;
        },
        //获取身份的所有人员--返回人员的对象数组
        listPersonWithIdentity: function(name){
            getOrgActions();
            var data = {"identityList": getNameFlag(name)};
            var v = null;
            orgActions.listPersonWithIdentity(data, function(json){v = json.data;}, null, false);
            return v;
        },
        //获取身份的所有人员--返回人员的对象数组或人员对象
        getPersonWithIdentity: function(name){
            getOrgActions();
            var data = {"identityList": getNameFlag(name)};
            var v = null;
            orgActions.listPersonWithIdentity(data, function(json){v = json.data;}, null, false);
            return (v && v.length===1) ? v[0] : v;
        },
        //查询组织成员的人员--返回人员的对象数组
        //nested  布尔  true嵌套的所有成员；false直接成员；默认false；
        listPersonWithUnit: function(name, nested){
            getOrgActions();
            var data = {"unitList": getNameFlag(name)};
            var v = null;
            if (nested){
                orgActions.listPersonWithUnitNested(data, function(json){v = json.data;}, null, false);
            }else{
                orgActions.listPersonWithUnitDirect(data, function(json){v = json.data;}, null, false);
            }
            return v;
        },

        //人员属性************
        //添加人员属性值(在属性中添加values值，如果没有此属性，则创建一个)
        appendPersonAttribute: function(person, attr, values){
            getOrgActions();
            var personFlag = (typeOf(person)==="object") ? (person.distinguishedName || person.id || person.unique || person.name) : person;
            var data = {"attributeList":values,"name":attr,"person":personFlag};
            orgActions.appendPersonAttribute(data, function(json){
                if (json.data.value){
                    if (success) success();
                }else{
                    if (failure) failure(null, "", "append values failed");
                }
            }, function(xhr, text, error){
                if (failure) failure(xhr, text, error);
            }, false);
        },
        //设置人员属性值(将属性值修改为values，如果没有此属性，则创建一个)
        setPersonAttribute: function(person, attr, values){
            getOrgActions();
            var personFlag = (typeOf(person)==="object") ? (person.distinguishedName || person.id || person.unique || person.name) : person;
            var data = {"attributeList":values,"name":attr,"person":personFlag};
            orgActions.setPersonAttribute(data, function(json){
                if (json.data.value){
                    if (success) success();
                }else{
                    if (failure) failure(null, "", "append values failed");
                }
            }, function(xhr, text, error){
                if (failure) failure(xhr, text, error);
            }, false);
        },
        //获取人员属性值
        getPersonAttribute: function(person, attr){
            getOrgActions();
            var personFlag = (typeOf(person)==="object") ? (person.distinguishedName || person.id || person.unique || person.name) : person;
            var data = {"name":attr,"person":personFlag};
            var v = null;
            orgActions.getPersonAttribute(data, function(json){v = json.data.attributeList;}, null, false);
            return v;
        },
        //列出人员所有属性的名称
        listPersonAttributeName: function(name){
            getOrgActions();
            var data = {"personList":getNameFlag(name)};
            var v = null;
            orgActions.listPersonAttributeName(data, function(json){v = json.data.nameList;}, null, false);
            return v;
        },
        //列出人员的所有属性
        listPersonAllAttribute: function(name){
            getOrgActions();
            var data = {"personList":getNameFlag(name)};
            var v = null;
            orgActions.listPersonAllAttribute(data, function(json){v = json.data;}, null, false);
            return v;
        },

        //身份**********
        //获取身份
        getIdentity: function(name){
            getOrgActions();
            var data = {"identityList":getNameFlag(name)};
            var v = null;
            orgActions.listIdentity(data, function(json){v = json.data;}, null, false);
            return (v && v.length===1) ? v[0] : v;
        },
        //列出人员的身份
        listIdentityWithPerson: function(name){
            getOrgActions();
            var data = {"personList":getNameFlag(name)};
            var v = null;
            orgActions.listIdentityWithPerson(data, function(json){v = json.data;}, null, false);
            return v;
        },
        //查询组织成员身份--返回身份的对象数组
        //nested  布尔  true嵌套的所有成员；false直接成员；默认false；
        listIdentityWithUnit: function(name, nested){
            getOrgActions();
            var data = {"unitList": getNameFlag(name)};
            var v = null;
            if (nested){
                orgActions.listIdentityWithUnitNested(data, function(json){v = json.data;}, null, false);
            }else{
                orgActions.listIdentityWithUnitDirect(data, function(json){v = json.data;}, null, false);
            }
            return v;
        },

        //组织**********
        //获取组织
        getUnit: function(name){
            getOrgActions();
            var data = {"unitList":getNameFlag(name)};
            var v = null;
            orgActions.listUnit(data, function(json){v = json.data;}, null, false);
            return (v && v.length===1) ? v[0] : v;
        },
        //查询组织的下级--返回组织的对象数组
        //nested  布尔  true嵌套下级；false直接下级；默认false；
        listSubUnit: function(name, nested){
            getOrgActions();
            var data = {"unitList": getNameFlag(name)};
            var v = null;
            if (nested){
                orgActions.listUnitSubNested(data, function(json){v = json.data;}, null, false);
            }else{
                orgActions.listUnitSubDirect(data, function(json){v = json.data;}, null, false);
            }
            return v;
        },
        //查询组织的上级--返回组织的对象数组
        //nested  布尔  true嵌套上级；false直接上级；默认false；
        listSupUnit: function(name, nested){
            getOrgActions();
            var data = {"unitList": getNameFlag(name)};
            var v = null;
            if (nested){
                orgActions.listUnitSupNested(data, function(json){v = json.data;}, null, false);
            }else{
                orgActions.listUnitSupDirect(data, function(json){v = json.data;}, null, false);
            }
            return v;
        },
        //根据个人身份获取组织
        //flag 数字    表示获取第几层的组织
        //     字符串  表示获取指定类型的组织
        //     空     表示获取直接所在的组织
        getUnitByIdentity: function(name, flag){
            getOrgActions();
            var getUnitMethod = "current";
            var v;
            if (flag){
                if (typeOf(flag)==="string") getUnitMethod = "type";
                if (typeOf(flag)==="number") getUnitMethod = "level";
            }
            switch (getUnitMethod){
                case "current":
                    var data = {"identityList":getNameFlag(name)};
                    orgActions.f(data, function(json){ v = json.data; }, null, false);
                    break;
                case "type":
                    var data = {"identity":(typeOf(name)==="object") ? (name.distinguishedName || name.id || name.unique || name.name) : name,"type":flag};
                    orgActions.getUnitWithIdentityAndType(data, function(json){ v = json.data; }, null, false);
                    break;
                case "level":
                    var data = {"identity":(typeOf(name)==="object") ? (name.distinguishedName || name.id || name.unique || name.name) : name,"level":flag};
                    orgActions.getUnitWithIdentityAndLevel(data, function(json){ v = json.data; }, null, false);
                    break;
            }
            return v;
        },
        //列出身份所在组织的所有上级组织
        listAllSupUnitWithIdentity: function(name){
            getOrgActions();
            var data = {"identityList":getNameFlag(name)};
            var v = null;
            orgActions.listUnitSupNestedWithIdentity(data, function(json){v = json.data;}, null, false);
            return v;
        },
        //获取人员所在的所有组织
        listUnitWithPerson: function(name){
            getOrgActions();
            var data = {"personList":getNameFlag(name)};
            var v = null;
            orgActions.listUnitWithPerson(data, function(json){v = json.data;}, null, false);
            return v;
        },
        //列出人员所在组织的所有上级组织
        listAllSupUnitWithPerson: function(name){
            getOrgActions();
            var data = {"personList":getNameFlag(name)};
            var v = null;
            orgActions.listUnitSupNestedWithPerson(data, function(json){v = json.data;}, null, false);
            return v;
        },
        //根据组织属性，获取所有符合的组织
        listUnitWithAttribute: function(name, attribute){
            getOrgActions();
            var data = {"name":name,"attribute":attribute};
            var v = null;
            orgActions.listUnitWithAttribute(data, function(json){v = json.data;}, null, false);
            return v;
        },
        //根据组织职务，获取所有符合的组织
        listUnitWithDuty: function(name, id){
            getOrgActions();
            var data = {"name":name,"identity":(typeOf(id)==="object") ? (id.distinguishedName || id.id || id.unique || id.name) : id};
            var v = null;
            orgActions.listUnitWithDuty(data, function(json){v = json.data;}, null, false);
            return v;
        },

        //组织职务***********
        //获取指定的组织职务的身份
        getDuty: function(duty, id){
            getOrgActions();
            var data = {"name":duty,"unit":(typeOf(id)==="object") ? (id.distinguishedName || id.id || id.unique || id.name) : id};
            var v = null;
            orgActions.getDuty(data, function(json){v = json.data;}, null, false);
            return v;
        },
        //获取身份的所有职务名称
        listDutyNameWithIdentity: function(name){
            getOrgActions();
            var data = {"identityList":getNameFlag(name)};
            var v = null;
            orgActions.listDutyNameWithIdentity(data, function(json){v = json.data.nameList;}, null, false);
            return v;
        },
        //获取组织的所有职务名称
        listDutyNameWithUnit: function(name){
            getOrgActions();
            var data = {"unitList":getNameFlag(name)};
            var v = null;
            orgActions.listDutyNameWithUnit(data, function(json){v = json.data.nameList;}, null, false);
            return v;
        },
        //获取组织的所有职务
        listUnitAllDuty: function(name){
            getOrgActions();
            var data = {"unitList":getNameFlag(name)};
            var v = null;
            orgActions.listUnitAllDuty(data, function(json){v = json.data;}, null, false);
            return v;
        },

        //组织属性**************
        //添加组织属性值(在属性中添加values值，如果没有此属性，则创建一个)
        appendUnitAttribute: function(unit, attr, values){
            getOrgActions();
            var unitFlag = (typeOf(unit)==="object") ? (unit.distinguishedName || unit.id || unit.unique || unit.name) : unit;
            var data = {"attributeList":values,"name":attr,"unit":unitFlag};
            orgActions.appendUnitAttribute(data, function(json){
                if (json.data.value){
                    if (success) success();
                }else{
                    if (failure) failure(null, "", "append values failed");
                }
            }, function(xhr, text, error){
                if (failure) failure(xhr, text, error);
            }, false);
        },
        //设置组织属性值(将属性值修改为values，如果没有此属性，则创建一个)
        setUnitAttribute: function(unit, attr, values){
            getOrgActions();
            var unitFlag = (typeOf(unit)==="object") ? (unit.distinguishedName || unit.id || unit.unique || unit.name) : unit;
            var data = {"attributeList":values,"name":attr,"unit":unitFlag};
            orgActions.setUnitAttribute(data, function(json){
                if (json.data.value){
                    if (success) success();
                }else{
                    if (failure) failure(null, "", "append values failed");
                }
            }, function(xhr, text, error){
                if (failure) failure(xhr, text, error);
            }, false);
        },
        //获取组织属性值
        getUnitAttribute: function(unit, attr){
            getOrgActions();
            var unitFlag = (typeOf(unit)==="object") ? (unit.distinguishedName || unit.id || unit.unique || unit.name) : unit;
            var data = {"name":attr,"unit":unitFlag};
            var v = null;
            orgActions.getUnitAttribute(data, function(json){v = json.data.attributeList;}, null, false);
            return v;
        },
        //列出组织所有属性的名称
        listUnitAttributeName: function(name){
            getOrgActions();
            var data = {"unitList":getNameFlag(name)};
            var v = null;
            orgActions.listUnitAttributeName(data, function(json){v = json.data.nameList;}, null, false);
            return v;
        },
        //列出组织的所有属性
        listUnitAllAttribute: function(name){
            getOrgActions();
            var data = {"unitList":getNameFlag(name)};
            var v = null;
            orgActions.listUnitAllAttribute(data, function(json){v = json.data;}, null, false);
            return v;
        }
    };

    this.Action = (function(){
        var actions = [];
        return function(root, json){
            var action = actions[root] || (actions[root] = new MWF.xDesktop.Actions.RestActions("", root, ""));
            action.getActions = function(callback){
                if (!this.actions) this.actions = {};
                Object.merge(this.actions, json);
                if (callback) callback();
            };
            this.invoke = function(option){
                action.invoke(option)
            }
        }
    })();

    this.service = {
        "jaxwsClient": {},
        "jaxrsClient":{}
    };

    var lookupAction = null;
    var getLookupAction = function(callback){
        if (!lookupAction){
            MWF.require("MWF.xDesktop.Actions.RestActions", function(){
                lookupAction = new MWF.xDesktop.Actions.RestActions("", "x_processplatform_assemble_surface", "");
                lookupAction.getActions = function(actionCallback){
                    this.actions = {
                        //"lookup": {"uri": "/jaxrs/view/flag/{view}/application/flag/{application}"},
                        //"getView": {"uri": "/jaxrs/view/{id}/design"}
                        "lookup": {"uri": "/jaxrs/queryview/flag/{view}/application/flag/{application}/execute", "method":"PUT"},
                        "getView": {"uri": "/jaxrs/queryview/flag/{view}/application/flag/{application}"}
                    };
                    if (actionCallback) actionCallback();
                };
                if (callback) callback();
            });
        }else{
            if (callback) callback();
        }
    };

    this.view = {
        "lookup": function(view, callback){
            getLookupAction(function(){
                lookupAction.invoke({"name": "lookup","async": true, "parameter": {"view": view.view, "application": view.application},"success": function(json){
                    var data = {
                        "grid": json.data.grid,
                        "groupGrid": json.data.groupGrid
                    };
                    if (callback) callback(data);
                }.bind(this)});
            }.bind(this));
        },
        "select": function(view, callback, options){
            if (view.view){
                var viewJson = {
                    "application": view.application || _form.json.application,
                    "viewName": view.view || "",
                    "isTitle": view.isTitle || "yes",
                    "select": view.select || "multi",
                    "title": view.title || "Select View"
                };
                if (!options) options = {};
                var width = options.width || "700";
                var height = options.height || "400";

                var size;
                if (layout.mobile){
                    size = document.body.getSize();
                    width = size.x;
                    height = size.y;
                    options.style = "viewmobile";
                }
                width = width.toInt();
                height = height.toInt();

                size = _form.app.content.getSize();
                var x = (size.x-width)/2;
                var y = (size.y-height)/2;
                if (x<0) x = 0;
                if (y<0) y = 0;
                if (layout.mobile){
                    x = 20;
                    y = 0;
                }

                var _self = this;
                MWF.require("MWF.xDesktop.Dialog", function(){
                    var dlg = new MWF.xDesktop.Dialog({
                        "title": viewJson.title || "select view",
                        "style": options.style || "view",
                        "top": y,
                        "left": x-20,
                        "fromTop":y,
                        "fromLeft": x-20,
                        "width": width,
                        "height": height,
                        "html": "<div style='height: 100%;'></div>",
                        "maskNode": _form.app.content,
                        "container": _form.app.content,
                        "buttonList": [
                            {
                                "text": MWF.LP.process.button.ok,
                                "action": function(){
                                    //if (callback) callback(_self.view.selectedItems);
                                    if (callback) callback(_self.view.getData());
                                    this.close();
                                }
                            },
                            {
                                "text": MWF.LP.process.button.cancel,
                                "action": function(){this.close();}
                            }
                        ]
                    });
                    dlg.show();

                    if (layout.mobile){
                        var backAction = dlg.node.getElement(".MWF_dialod_Action_back");
                        var okAction = dlg.node.getElement(".MWF_dialod_Action_ok");
                        if (backAction) backAction.addEvent("click", function(){
                            dlg.close();
                        }.bind(this));
                        if (okAction) okAction.addEvent("click", function(){
                            //if (callback) callback(this.view.selectedItems);
                            if (callback) callback(this.view.getData());
                            dlg.close();
                        }.bind(this));
                    }

                    MWF.xDesktop.requireApp("query.Query", "Viewer", function(){
                        this.view = new MWF.xApplication.query.Query.Viewer(dlg.content.getFirst(), viewJson, {"style": "select"});
                    }.bind(this));
                }.bind(this));
            }
        }
    };

    //include 引用脚本
    var includedScripts = [];
    this.include = function(name, callback){
        if (includedScripts.indexOf(name)===-1){
            if (!this.scriptAction){
                MWF.require("MWF.xScript.Actions.ScriptActions", null, false);
                this.scriptAction = new MWF.xScript.Actions.ScriptActions();
            }
            this.scriptAction.getScriptByName(_form.json.application, name, includedScripts, function(json){
                if (json.data){
                    includedScripts = includedScripts.concat(json.data.importedList);
                    MWF.Macro.exec(json.data.text, this);
                    if (callback) callback.apply(this);
                }else{
                    if (callback) callback.apply(this);
                }
            }.bind(this), null, false);
        }else{
            if (callback) callback.apply(this);
        }
    }.bind(this);
    this.define = function(name, fun, overwrite){
        var over = true;
        if (overwrite===false) over = false;
        var o = {};
        o[name] = {"value": fun, "configurable": over};
        MWF.defineProperties(this, o);
    }.bind(this);

    //仅前台对象-----------------------------------------
    //form
    this.form = {
        "getApp": function(){return _form.app;},
        "app": _form.app,
        "node": function(){return _form.node;},
        "readonly": _form.options.readonly,
        "get": function(name){return _form.all[name];},
        "getField": function(name){return _forms[name];},
        "getAction": function(){return _form.workAction},
        "getDesktop": function(){return _form.app.desktop},
        "getData": function(){return new MWF.xScript.JSONData(_form.getData());},
        "save": function(callback){_form.saveWork(callback);},
        "close": function(){_form.closeWork();},
        "process": function(option){
            if (option){
                _form.submitWork(option.routeName, option.opinion, option.callback);
            }else{
                _form.processWork();
            }
        },
        "reset": function(option){
            if (!option){
                if (_form.businessData.control["allowReset"]) _form.resetWork();
            }else{
                _form.resetWorkToPeson(option.names, option.opinion, opinion.success, opinion.failure);
            }
        },
        "retract": function(option){
            if (!option){
                if (_form.businessData.control["allowRetract"]) _form.retractWork();
            }else{
                _form.doRetractWork(opinion.success, opinion.failure);
            }
        },
        "print": function(application, form){
            _form.printWork(application, form);
        },
        "deleteWork": function(option){
            if (!option){
                if (_form.businessData.control["allowDeleteWork"]) _form.deleteWork();
            }else{
                _form.doDeleteWork(opinion.success, opinion.failure);
            }
        },
        "confirm": function(type, title, text, width, height, ok, cancel, callback){
            var p = MWF.getCenter({"x": width, "y": height});
            e = {"event": {"clientX": p.x,"x": p.x,"clientY": p.y,"y": p.y}};
            _form.confirm(type, e, title, text, width, height, ok, cancel, callback);
        },
        "notice": function(content, type, target, where){
            _form.notice(content, type, target, where);
        },
        "addEvent": function(e, f){_form.addEvent(e, f);},
        "openWindow": function(form, app){
            _form.openWindow(form, app);
        }
    };
    this.form.currentRouteName = _form.json.currentRouteName;
    this.form.opinion = _form.json.opinion;

    this.target = ev.target;
    this.event = ev.event;
    this.status = ev.status;
    this.session = layout.desktop.session;
};


MWF.xScript.JSONData = function(data, callback, key, parent){
    var getter = function(data, callback, k, _self){
        return function(){return (["array","object"].indexOf(typeOf(data[k]))===-1) ? data[k] : new MWF.xScript.JSONData(data[k], callback, k, _self);};
    };
    var setter = function(data, callback, k, _self){
        return function(v){
            data[k] = v;
            //debugger;
            //this.add(k, v, true);
            if (callback) callback(data, k, _self);
        }
    };
    var define = function(){
        var o = {};
        for (var k in data) o[k] = {"configurable": true, "enumerable": true, "get": getter.apply(this, [data, callback, k, this]),"set": setter.apply(this, [data, callback, k, this])};
        o["length"] = {"get": function(){return Object.keys(data).length;}};
        MWF.defineProperties(this, o);

        var methods = {
            "getKey": {"value": function(){ return key; }},
            "getParent": {"value": function(){ return parent; }},
            "toString": {"value": function() { return data.toString();}},
            "add": {"value": function(newKey, newValue, overwrite){
                var flag = true;
                var type = typeOf(data);
                if (type==="array"){
                    if (arguments.length<2){
                        data.push(newKey);
                        newValue = newKey;
                        newKey = data.length-1;
                    }else{
                        if (!newKey && newKey!==0){
                            data.push(newValue);
                            newKey = data.length-1;
                        }else{
                            flag = false;
                        }
                    }
                    if (flag){
                        var o = {};
                        o[newKey] = {"configurable": true, "enumerable": true, "get": getter.apply(this, [data, callback, newKey, this]),"set": setter.apply(this, [data, callback, newKey, this])};
                        MWF.defineProperties(this, o);
                    }
                    this[newKey] = newValue;
                }else if (type==="object"){
                    if (!this.hasOwnProperty(newKey)){
                        data[newKey] = newValue;

                        if (flag){
                            var o = {};
                            o[newKey] = {"configurable": true, "enumerable": true, "get": getter.apply(this, [data, callback, newKey, this]),"set": setter.apply(this, [data, callback, newKey, this])};
                            MWF.defineProperties(this, o);
                        }
                        this[newKey] = newValue;
                    }else{
                        if (overwrite) this[newKey] = newValue;
                    }
                }

                return this[newKey];
            }},
            "del": {"value": function(delKey){
                if (!this.hasOwnProperty(delKey)) return null;
                delete data[newKey];
                delete this[newKey];
                return this;
            }}
        };
        MWF.defineProperties(this, methods);




        //this.getKey = function(){ return key; };
        //this.getParent = function(){ return parent; };
        //this.toString = function() { return data.toString();};
        //this.add = function(newKey, newValue, overwrite){
        //    var flag = true;
        //    var type = typeOf(data);
        //    if (!this.hasOwnProperty(newKey)){
        //        if (type=="array"){
        //            if (arguments.length<2){
        //                data.push(newKey);
        //                newValue = newKey;
        //                newKey = data.length-1;
        //            }else{
        //                debugger;
        //                if (!newKey && newKey!=0){
        //                    data.push(newValue);
        //                    newKey = data.length-1;
        //                }else{
        //                    flag == false;
        //                }
        //            }
        //        }else{
        //            data[newKey] = newValue;
        //        }
        //        //var valueType = typeOf(newValue);
        //        //var newValueData = newValue;
        //        //if (valueType=="object" || valueType=="array") newValueData = new MWF.xScript.JSONData(newValue, callback, newKey, this);
        //        //if (valueType=="null") newValueData = new MWF.xScript.JSONData({}, callback, newKey, this);
        //        if (flag){
        //            var o = {};
        //            o[newKey] = {"configurable": true, "enumerable": true, "get": getter.apply(this, [data, callback, newKey, this]),"set": setter.apply(this, [data, callback, newKey, this])};
        //            MWF.defineProperties(this, o);
        //        }
        //        this[newKey] = newValue;
        //    }else{
        //        if (overwrite) this[newKey] = newValue;
        //    }
        //
        //    //var valueType = typeOf(newValue);
        //    //var newValueData = newValue;
        //    //if (valueType=="object" || valueType=="array") newValueData = new MWF.xScript.JSONData(newValue, callback, newKey, this);
        //    //if (valueType=="null") newValueData = new MWF.xScript.JSONData({}, callback, newKey, this);
        //    //
        //    //this[newKey] = newValueData;
        //
        //    return this[newKey];
        //};
        //this.del = function(delKey){
        //    if (!this.hasOwnProperty(delKey)) return null;
        //    delete data[newKey];
        //    delete this[newKey];
        //    return this;
        //};
    };
    var type = typeOf(data);
    if (type==="object" || type==="array") define.apply(this);
};

MWF.xScript.createDict = function(application){
    return function(name){
        var applicationId = application;
        this.name = name;
        MWF.require("MWF.xScript.Actions.DictActions", null, false);
        var action = new MWF.xScript.Actions.DictActions();

        this.get = function(path, success, failure){
            var arr = path.split(/\./g);
            arr.map(function(v){
                return
            });
            var p = path.replace(/\./g, "/");
            var value = null;
            action.getDict(applicationId, encodeURIComponent(this.name), p, function(json){
                value = json.data;
                if (success) success(json.data);
            }, function(xhr, text, error){
                if (failure) failure(xhr, text, error);
            }, false);
            return value;
        };

        this.set = function(path, value, success, failure){
            var p = path.replace(/\./g, "/");
            action.setDict(applicationId, encodeURIComponent(this.name), p, value, function(json){
                if (success) success(json.data);
            }, function(xhr, text, error){
                if (failure) failure(xhr, text, error);
            });
        };
        this.add = function(path, value, success, failure){
            var p = path.replace(/\./g, "/");
            action.addDict(applicationId, encodeURIComponent(this.name), p, value, function(json){
                if (success) success(json.data);
            }, function(xhr, text, error){
                if (failure) failure(xhr, text, error);
            });
        };
        this["delete"] = function(path, success, failure){
            var p = path.replace(/\./g, "/");
            action.deleteDict(applicationId, encodeURIComponent(this.name), p, function(json){
                if (success) success(json.data);
            }, function(xhr, text, error){
                if (failure) failure(xhr, text, error);
            });
        };
        this.destory = this["delete"];
    }
};

