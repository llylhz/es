# This my first nginx Dockerfile
# Version 8.5.37
FROM centos:centos7
MAINTAINER lhz_me@126.com
WORKDIR /tomcat
RUN yum -y install wget gzip zip
RUN wget http://mirrors.shu.edu.cn/apache/tomcat/tomcat-8/v8.5.37/bin/apache-tomcat-8.5.37.tar.gz
RUN tar -xvf apache-tomcat-8.5.37.tar.gz -C /usr/local
ADD jdk-8u171-linux-x64.tar.gz /usr/local/
WORKDIR /usr/local/ 
RUN mv apache-tomcat-8.5.37 tomcat 
RUN mv jdk1.8.0_171 java
ENV JAVA_HOME /usr/local/java
ENV JRE_HOME $JAVA_HOME/jre
ENV CLASSPATH .:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar:$JRE_HOME/lib:$CLASSPATH
ENV PATH $JAVA_HOME/bin:$PATH
ENV CATALINA_HOME /usr/local/tomcat
EXPOSE 8080
CMD ["/usr/local/tomcat/bin/catalina.sh","run"]



