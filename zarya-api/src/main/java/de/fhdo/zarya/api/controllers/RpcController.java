package de.fhdo.zarya.api.controllers;

import de.fhdo.zarya.api.interfaces.services.IProxifyRpcService;
import jnr.constants.platform.IP;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@RestController
@AllArgsConstructor
@RequestMapping(value = "/auth/rpc", produces = "application/json")
public class RpcController {

    public IProxifyRpcService proxyRpcService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> proxyRpcCall(@RequestBody Map<String, Object> rpcRequest) {
        return proxyRpcService.proxyRpcCall(rpcRequest);
    }
}
