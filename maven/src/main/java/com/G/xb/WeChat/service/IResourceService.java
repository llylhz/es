package com.G.xb.WeChat.service;

import java.util.List;

import com.G.xb.WeChat.commons.result.Tree;
import com.G.xb.WeChat.commons.shiro.ShiroUser;
import com.G.xb.WeChat.model.Resource;
import com.baomidou.mybatisplus.service.IService;

/**
 *
 * Resource 表数据服务层接口
 *
 */
public interface IResourceService extends IService<Resource> {

    List<Resource> selectAll();

    List<Tree> selectAllMenu();

    List<Tree> selectAllTree();

    List<Tree> selectTree(ShiroUser shiroUser);

}