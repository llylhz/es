package com.G.xb.WeChat.service;

import java.util.List;

import com.G.xb.WeChat.commons.result.Tree;
import com.G.xb.WeChat.model.Organization;
import com.baomidou.mybatisplus.service.IService;

/**
 *
 * Organization 表数据服务层接口
 *
 */
public interface IOrganizationService extends IService<Organization> {

    List<Tree> selectTree();

    List<Organization> selectTreeGrid();

}