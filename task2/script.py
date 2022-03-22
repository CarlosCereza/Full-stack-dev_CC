#!/usr/bin/env python3

import gspread
import re
from datetime import datetime

# =======================================================================================================

def input():
    gc = gspread.oauth();
    wfDoc = gc.open("Copy of Task 1 - Workflow").sheet1.get_all_values();
    hnsDoc = gc.open("Copy of Task 1  - Hours Not Supported").sheet1.get_all_values(); # read both files into list of lists
    hnsOctober = trimHNSDoc(hnsDoc); #leave only relevant Hours Not Supported data (from October 2020)
    return hnsOctober, wfDoc;

def trimHNSDoc(hnsDoc):
    hnsOctober = [];
    pattern = re.compile(r"2020-10-[0-3][0-9]");
    # ------------------------------------------
    for row in hnsDoc:
        if re.match(pattern, row[1]): # filter by date using second collumn of the HNS Document
            hnsOctober.append(row);
    # ------------------------------------------
    return hnsOctober;

def calculateHNSEveryAgent(wfDoc, hnsOctober):
    result = list();
    i = 1; # loop variable
    # ----------------------------------------------------------------
    while i <= 31: # for every day in the month of October
        hnsOfTheDay = initializeHNSOfTheDay(wfDoc); # create dictionary of [agent] = Hours Not Supported taken that day(initial value - 0) 
        # ------------------------------------------------------------
        for row in hnsOctober: # for every record in HNS doc
            if datetime.strptime(row[1], "%Y-%m-%d").day == i: #if date matches date in question
                agent = row[0];
                hours = float(row[2]);
                if hnsOfTheDay.get(agent) is not None: # if agent is valid (recorded in Workflow Doc)
                    hnsOfTheDay[agent] = hnsOfTheDay[agent] + hours; # simply sum
        # -------------------------------
        result.append(hnsOfTheDay);
        i = i + 1; # increment
    # ----------------------------------------------------------------
    return result;

def initializeHNSOfTheDay(wfDoc): # create dictionary of [agent] = Hours Not Supported taken that day(initial value - 0) 
    hnsOfTheDay = {};
    # -------------------------------
    for j in range(1, len(wfDoc)): # for every line(agent) in Worfkflow doc
        agent = wfDoc[j][0];
        hnsOfTheDay[agent] = 0;
    # -------------------------------
    return hnsOfTheDay;

def covertToCells(worksheet, result, day):
    rangeStart = gspread.utils.rowcol_to_a1(2, 3+4*day);
    rangeEnd = gspread.utils.rowcol_to_a1(171, 3+4*day);
    cells = worksheet.range((rangeStart+":"+rangeEnd)); # generate range of cells(collumn) based on the day of the month
    # ------------------------------------------------
    for i in range (0, len(cells)): #foreach cell of the collumn
        cells[i].value = list(result[day-1].values())[i]; # fill cells with actual final hours not supported values
    # ------------------------------------------------
    return cells;

def output(result): # print out result to Workflow doc
    gc = gspread.oauth();
    worksheet = gc.open("Copy of Task 1 - Workflow").sheet1;
    # ---------------------------------------------------------
    i = 1; # loop variable
    while i <= 31:  # for every day in the month of October
        cells = covertToCells(worksheet, result, i); #create cells(collumn) object
        worksheet.update_cells(cells); #fill collumn
        i = i + 1; # increment

# =======================================================================================================

def main():
    hnsOctober, wfDoc = input(); # input data from both Google docs
    # -----------------------------------------------
    result = calculateHNSEveryAgent(wfDoc, hnsOctober);
    # -----------------------------------------------
    output(result); # output data to Workflow doc

main();