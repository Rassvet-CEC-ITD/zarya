package de.fhdo.zarya.api.interfaces.services;

import de.fhdo.zarya.api.dto.DataPoint;

import java.util.List;

public interface IDataPointsService {

    /**
     * Get all data points from blockchain or cache
     */
    List<DataPoint> getAllDataPoints() throws Exception;

    /**
     * Get data point by coordinates
     */
    DataPoint getDataPoint(int xIndex, int yIndex) throws Exception;

    /**
     * Refresh cache from blockchain
     */
    void refreshCache() throws Exception;
}
