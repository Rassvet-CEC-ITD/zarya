package de.fhdo.zarya.api.interfaces.services;

import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Type;

import java.math.BigInteger;
import java.util.List;

@SuppressWarnings("rawtypes")
public interface IContractReadService {

    /**
     * Fetch contract ABI from blockchain explorer
     */
    String getContractAbi(String contractAddress) throws Exception;

    /**
     * Call a read-only contract function
     */
    List<Type> callFunction(
            String contractAddress,
            String functionName,
            List<Type> inputParameters,
            List<TypeReference<?>> outputParameters) throws Exception;

    /**
     * Call a simple getter function that returns a string
     */
    String callStringGetter(String contractAddress, String functionName) throws Exception;

    /**
     * Call a function that returns uint256
     */
    BigInteger callUintGetter(String contractAddress, String functionName) throws Exception;
}
