// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract SCADA {

    struct BinaryInput {
        bool value;
        uint quality;
        uint256 timestamp;
    }

    struct AnalogInput {
        int32 value;
        uint quality;
        uint256 timestamp;
    }

    struct BinaryOutput {
        bool value;
        uint quality;
        uint256 timestamp;
    }

    //structs inside a struct is not supported
    /*struct Slave {
        address slave_address;
        BinaryInput[] binaryinput;
        AnalogInput[] analoginput;
        BinaryOutput[] binaryoutput;
    }*/

    struct slave {
        address slave_address;
        bool[] BI_val;
        uint[] BI_q;
        uint256[] BI_t;
        int[] AI_val;
        uint[] AI_q;
        uint256[] AI_t;
        bool[] BO_val;
        uint[] BO_q;
        uint256[] BO_t;
    }


    slave[] private slaves;

    event eventSomethingNew(address sender, string message, address _slave_address);

    /* ##################################################################################################################################################################### */
    /* This section contains functions for the HMI /*
    /* ##################################################################################################################################################################### */

    /**
     * @dev Creates a new slave with empty inputs and outputs
     * @param _slave_address Address from the slave that will provide the data
     */
    function CreateSlave (address _slave_address) public {
        slave memory newSlave = slave({
            slave_address: _slave_address,
            BI_val: new bool[](0),
            BI_q: new uint[](0),
            BI_t: new uint256[](0),
            AI_val: new int[](0),
            AI_q: new uint[](0),
            AI_t: new uint256[](0),
            BO_val: new bool[](0),
            BO_q: new uint[](0),
            BO_t: new uint256[](0)
        });
        slaves.push(newSlave);
        emit eventSomethingNew(msg.sender, "created a new slave with address", _slave_address);
        /*TODO: Check if the slave does not already exist */
    }

    /**
     * @dev Function to create a Binary Input
     * @param _slave_address Address from slave that will provide Binary Input values
     * @param quantity Quantity of binary inputs to create
     */
    function CreateBinaryInputs(address _slave_address, uint quantity) public {
        uint index = findSlaveIndex(_slave_address); /*TODO: simplify with mappings if possible */
        require(index != slaves.length, "Slave not found");
        for (uint i = 0; i < quantity; i++) {
            slaves[index].BI_val.push(false);
            slaves[index].BI_q.push(10);
            slaves[index].BI_t.push(block.timestamp);
        }
        emit eventSomethingNew(msg.sender, "new binary input created for address", _slave_address);
        }

    /**
     * @dev Function to get index of the slave according to its address
     * @return slave[] Returns all the objects.
     * TODO: it may be replaced with mappings
     */
    function ReadDB() public view returns (slave[] memory) {
      return slaves;
    }

    /**
     * @dev Function to get index of the slave according to its address
     * @param _slave_address Address from where it's neccesary to get the index in the struct
     * @return index that corresponds to the address of the slave
     * TODO: it may be replaced with mappings
     */
    function findSlaveIndex(address _slave_address) internal view returns (uint) {
        for (uint i = 0; i < slaves.length; i++) {
            if (slaves[i].slave_address == _slave_address) {
                return i;
            }
        }
        return slaves.length;
    }

    


    /* ##################################################################################################################################################################### */
    /* This section contains functions for the slaves /*
    /* ##################################################################################################################################################################### */
     /**
     * @dev Function to set values from slave
     * @param _BI_val array with values from BIs
     * @param _BI_q array with quality from BIs
     * @param _BI_t array with timestamps from BIs
     * @param _AI_val array with values from AIs
     * @param _AI_q array with quality from AIs
     * @param _AI_t array with timestamps from AIs
     * @param _BO_val array with values from BOs
     * @param _BO_q array with quality from BOs
     * @param _BO_t array with timestamp from BOs
     * TODO: implement return status code
     */
    function setProcessObjects(
        bool[] memory _BI_val, 
        uint[] memory _BI_q, 
        uint256[] memory _BI_t, 
        int[] memory _AI_val, 
        uint[] memory _AI_q, 
        uint256[] memory _AI_t,
        bool[] memory _BO_val, 
        uint[] memory _BO_q, 
        uint256[] memory _BO_t
    ) public {
        uint index = findSlaveIndex(msg.sender);
        require(index != slaves.length, "Slave not found in DB");

        slave memory SlaveData = slave({
            slave_address: msg.sender,
            BI_val: _BI_val,
            BI_q: _BI_q,
            BI_t: _BI_t,
            AI_val: _AI_val,
            AI_q: _AI_q,
            AI_t: _AI_t,
            BO_val: _BO_val,
            BO_q: _BO_q,
            BO_t: _BO_t
        });

        //TODO: check if array have the same quantity of process objects
        slaves[index] = SlaveData;
    }
    
}
 