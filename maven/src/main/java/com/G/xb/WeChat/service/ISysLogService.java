package com.G.xb.WeChat.service;

import com.G.xb.WeChat.commons.utils.PageInfo;
import com.G.xb.WeChat.model.SysLog;
import com.baomidou.mybatisplus.service.IService;

/**
 *
 * SysLog 表数据服务层接口
 *
 */
public interface ISysLogService extends IService<SysLog> {

    void selectDataGrid(PageInfo pageInfo);

}