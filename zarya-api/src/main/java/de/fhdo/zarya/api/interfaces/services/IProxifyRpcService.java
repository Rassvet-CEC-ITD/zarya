package de.fhdo.zarya.api.interfaces.services;

import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface IProxifyRpcService {
    ResponseEntity<Map<String, Object>> proxyRpcCall(Map<String, Object> rpcRequest);
}
