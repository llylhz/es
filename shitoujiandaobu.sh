#!/bin/bash
X=(石头 剪刀 布)  ##0：石头 1剪刀 2布

x=$[RANDOM%3]   ##随机数0 1 2

a=${X[$x]}        ##电脑随机出

echo "电脑出拳： $a "

read -p "请用户出拳(0,1,2)：" b

echo ${X[$b]} 

 

 case $x in

0)

 if [ $b == 0 ];then

   echo "平局！"

 elif [ $b == 1 ];then

   echo  "电脑胜！"

 else 

   echo "玩家胜"

  fi;;

 

1)

if [ $b == 0 ];then

   echo "玩家胜！"

 elif [ $b == 1 ];then

   echo  "平局！"

 else 

   echo "电脑胜"

  fi;;

 

2)

if [ $b == 0 ];then

   echo "玩家胜！"

 elif [ $b == 1 ];then

   echo  "电脑胜！"

 else 

   echo "平局"

  fi

 

 exit x

 

esac
