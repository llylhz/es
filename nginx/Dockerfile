# This my first nginx Dockerfile
# Version 1.0

# Base images
FROM centos:centos7
#MAINTAINER
MAINTAINER  lhz_me@126.com
WORKDIR /nginx
RUN yum install -y pcre-devel wget net-tools gcc zlib zlib-devel make openssl-devel gcc gcc-c++ glibc make autoconf openssl openssl-devel libxslt-devel -y gd gd-devel GeoIP GeoIP-devel pcre pcre-devel
RUN useradd -M -s /sbin/nologin nginx
RUN wget http://nginx.org/download/nginx-1.12.2.tar.gz
RUN tar xf nginx-1.12.2.tar.gz -C /usr/local/
WORKDIR /usr/local/nginx-1.12.2
RUN  ./configure --user=nginx --group=nginx --prefix=/usr/local/nginx --with-file-aio --with-http_ssl_module --with-http_realip_module --with-http_addition_module --with-http_xslt_module --with-http_image_filter_module --with-http_geoip_module --with-http_sub_module --with-http_dav_module --with-http_flv_module --with-http_mp4_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_auth_request_module --with-http_random_index_module --with-http_secure_link_module --with-http_degradation_module --with-http_stub_status_module && make && make install
RUN echo "daemon off;" >> /usr/local/nginx/conf/nginx.conf
EXPOSE 80
CMD ["/usr/local/nginx/sbin/nginx"]
