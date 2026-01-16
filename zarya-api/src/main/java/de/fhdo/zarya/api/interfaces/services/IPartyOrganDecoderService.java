package de.fhdo.zarya.api.interfaces.services;

public interface IPartyOrganDecoderService {
    String decodeOrganHash(byte[] organHashBytes);
}
