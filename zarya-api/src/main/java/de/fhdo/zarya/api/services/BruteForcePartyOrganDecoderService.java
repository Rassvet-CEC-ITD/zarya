package de.fhdo.zarya.api.services;

import de.fhdo.zarya.api.interfaces.services.IPartyOrganDecoderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Hash;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class BruteForcePartyOrganDecoderService implements IPartyOrganDecoderService {
    
    private final Map<String, String> HASH_TO_IDENTIFIER = new HashMap<>();

    // Postfixes from PartyOrgans.sol
    private static final String CONGRESS_POSTFIX = "СЗД";
    private static final String SOVIET_POSTFIX = "СОВ";
    private static final String CHAIRPERSON_POSTFIX = "ПРЛ";
    private static final String GENERAL_ASSEMBLY_POSTFIX = "ОБС";
    private static final String CONFERENCE_POSTFIX = "КОН";
    
    // All region codes from Regions.sol
    private static final String[] REGION_CODES = {
        "00", "01", "02", "03", "04", "05", "06", "07", "08", "09",
        "10", "11", "12", "13", "14", "15", "16", "17", "18", "19",
        "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
        "31", "32", "33", "34", "35", "36", "37", "38", "39", "40",
        "41", "42", "43", "44", "45", "46", "47", "48", "49", "50",
        "51", "52", "53", "54", "55", "56", "57", "58", "59", "60",
        "61", "62", "63", "64", "65", "66", "67", "68", "69", "70",
        "71", "72", "73", "74", "75", "76", "77", "78", "79", "80",
        "81", "82", "83", "84", "85", "86", "87", "88", "89", "90",
        "92", "93", "94", "95", "96", "97", "98", "99"
    };

    @Value("${zarya.scan.organs.size}")
    private int scanOrganSize;

    public BruteForcePartyOrganDecoderService() {
        buildReverseLookup();
    }

    private void buildReverseLookup() {
        // Federal-level organs (no region)
        addOrgan("0.0" + CHAIRPERSON_POSTFIX);
        addOrgan("0.0" + SOVIET_POSTFIX);
        addOrgan("0.0" + CONGRESS_POSTFIX);
        
        // Regional organs
        for (String region : REGION_CODES) {
            // RegionalSoviet: REGION.СОВ
            addOrgan(region + "." + SOVIET_POSTFIX);
            
            // RegionalConference: REGION.КОН
            addOrgan(region + "." + CONFERENCE_POSTFIX);
            
            // RegionalGeneralAssembly: REGION.ОБС
            addOrgan(region + "." + GENERAL_ASSEMBLY_POSTFIX);
            
            // Local organs with numbers (0-999 should cover most cases)
            for (int num = 0; num < scanOrganSize; num++) {
                // LocalSoviet: REGION.NUMBER.СОВ
                addOrgan(region + "." + num + "." + SOVIET_POSTFIX);
                
                // LocalGeneralAssembly: REGION.NUMBER.ОБС
                addOrgan(region + "." + num + "." + GENERAL_ASSEMBLY_POSTFIX);
            }
        }
    }
    
    private void addOrgan(String identifier) {
        String hash = computeKeccak256(identifier);
        HASH_TO_IDENTIFIER.put(hash, identifier);
    }
    
    private String computeKeccak256(String input) {
        byte[] hash = Hash.sha3(input.getBytes());
        return bytesToHex(hash);
    }
    
    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
    
    public String decodeOrganHash(byte[] organHashBytes) {
        String hash = bytesToHex(organHashBytes);
        return HASH_TO_IDENTIFIER.getOrDefault(hash, "Unknown Organ (0x" + hash + ")");
    }
    
    public String decodeOrganHash(String organHash) {
        // Remove 0x prefix if present
        if (organHash.startsWith("0x")) {
            organHash = organHash.substring(2);
        }
        return HASH_TO_IDENTIFIER.getOrDefault(organHash.toLowerCase(), "Unknown Organ (0x" + organHash + ")");
    }
}
