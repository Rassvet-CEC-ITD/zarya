package de.fhdo.zarya.api.controllers;

import de.fhdo.zarya.api.dto.CellSampleElement;
import de.fhdo.zarya.api.dto.CellSampleElementValue;
import de.fhdo.zarya.api.dto.DataPoint;
import de.fhdo.zarya.api.interfaces.services.IDataPointsService;
import org.openpdf.text.Cell;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigInteger;
import java.util.List;

@RestController
@RequestMapping(value= "/data", produces = "application/json")
public class DataController {

}
