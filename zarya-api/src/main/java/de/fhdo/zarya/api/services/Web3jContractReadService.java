package de.fhdo.zarya.api.services;

import de.fhdo.zarya.api.interfaces.services.IContractReadService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthCall;
import org.web3j.protocol.http.HttpService;

import java.math.BigInteger;
import java.util.Collections;
import java.util.List;

@SuppressWarnings("rawtypes")
@Slf4j
@Service
public class Web3jContractReadService implements IContractReadService {

    @Value("${ethereum.rpc.url:http://localhost:8545}")
    private String rpcUrl;

    @Value("${zarya.address}")
    private String zaryaContractAddress;

    /**
     * Call a read-only contract function
     */
    @Override
    public List<Type> callFunction(
            String functionName,
            List<Type> inputParameters,
            List<TypeReference<?>> outputParameters) throws Exception {

        Function function;
        EthCall ethCall;
        try (Web3j web3j = Web3j.build(new HttpService(rpcUrl))) {

            // Create function
            function = new Function(
                    functionName,
                    inputParameters,
                    outputParameters
            );

            // Encode function call
            String encodedFunction = FunctionEncoder.encode(function);

            // Create transaction
            Transaction transaction = Transaction.createEthCallTransaction(
                    null,
                    zaryaContractAddress,
                    encodedFunction
            );

            // Execute call
            ethCall = web3j.ethCall(transaction, DefaultBlockParameterName.LATEST).send();
        }

        if (ethCall.hasError()) {
            throw new RuntimeException("Error calling contract function: " + ethCall.getError().getMessage());
        }

        String value = ethCall.getValue();
        log.debug("Contract call result: {}", value);

        // Decode response
        return FunctionReturnDecoder.decode(value, function.getOutputParameters());
    }

    @Override
    public String callStringGetter(String functionName) throws Exception {
        List<Type> result = callFunction(
                functionName,
                Collections.emptyList(),
                List.of(new TypeReference<org.web3j.abi.datatypes.Utf8String>() {})
        );

        if (result.isEmpty()) {
            return null;
        }

        return (String) result.getFirst().getValue();
    }

    @Override
    public BigInteger callUintGetter(String functionName) throws Exception {
        List<Type> result = callFunction(
                functionName,
                Collections.emptyList(),
                List.of(new TypeReference<org.web3j.abi.datatypes.generated.Uint256>() {})
        );

        if (result.isEmpty()) {
            return null;
        }

        return (BigInteger) result.getFirst().getValue();
    }
}
