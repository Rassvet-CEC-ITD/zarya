package de.fhdo.zarya.api.configurations;

import de.fhdo.zarya.api.filters.RateLimitFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/home").setViewName("home");
        registry.addViewController("/").setViewName("home");
        registry.addViewController("/status").setViewName("status");
        registry.addViewController("/login").setViewName("login");
    }

    @Bean
    public FilterRegistrationBean<RateLimitFilter> rateLimitFilter(){
        FilterRegistrationBean<RateLimitFilter> registrationBean
                = new FilterRegistrationBean<>();
        registrationBean.setFilter(new RateLimitFilter());
        registrationBean.addUrlPatterns("/rpc/*");
        registrationBean.setOrder(1);
        return registrationBean;
    }
}
