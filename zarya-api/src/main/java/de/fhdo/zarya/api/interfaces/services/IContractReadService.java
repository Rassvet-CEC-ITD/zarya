package de.fhdo.zarya.api.interfaces.services;

import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Type;

import java.math.BigInteger;
import java.util.List;

@SuppressWarnings("rawtypes")
public interface IContractReadService {

    /**
     * Call a read-only contract function
     */
    List<Type> callFunction(
            String functionName,
            List<Type> inputParameters,
            List<TypeReference<?>> outputParameters) throws Exception;

    /**
     * Call a simple getter function that returns a string
     */
    String callStringGetter(String functionName) throws Exception;

    /**
     * Call a function that returns uint256
     */
    BigInteger callUintGetter(String functionName) throws Exception;
}
