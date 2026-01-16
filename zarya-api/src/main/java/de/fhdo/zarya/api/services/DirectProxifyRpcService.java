package de.fhdo.zarya.api.services;

import de.fhdo.zarya.api.interfaces.services.IProxifyRpcService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
public class DirectProxifyRpcService implements IProxifyRpcService {

    @Value("${ethereum.rpc.url:http://localhost:8545}")
    private String ethereumRpcUrl;

    private final RestTemplate restTemplate;

    public DirectProxifyRpcService() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public ResponseEntity<Map<String, Object>> proxyRpcCall(Map<String, Object> rpcRequest) {
        try {
            log.debug("Proxying RPC call to Ethereum client: {}", rpcRequest);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(rpcRequest, headers);

            var response = restTemplate.exchange(
                    ethereumRpcUrl,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            log.debug("Received response from Ethereum client: {}", response.getBody());

            //noinspection unchecked
            return ResponseEntity
                    .status(response.getStatusCode())
                    .body((Map<String, Object>) response.getBody());

        } catch (Exception e) {
            log.error("Error proxying RPC call to Ethereum client", e);
            return ResponseEntity
                    .status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "error", Map.of(
                                    "code", -32603,
                                    "message", "Internal error: " + e.getMessage()
                            )
                    ));
        }
    }
}
