@isTest
public class ProgramRadioOptionsControllerTest {

    @isTest
    static void testGetProgramOptions() {
        // Create test Programs
        //Program prog() : [SELECT Id, Name, code__c FROM Program WHERE Available_for_Registration__c = TRUE];
        Program p1 = new Program(Name='Program A', code__c='A001', Available_for_Registration__c=true);
        Program p2 = new Program(Name='Program B', code__c='B002', Available_for_Registration__c=true);
        Program p3 = new Program(Name='Program C', code__c='C003', Available_for_Registration__c=false); // Should not be returned
        insert new List<Program>{p1, p2, p3};
        //insert new List<Program>{prog};

        // Setup input and output maps as expected by Callable
        Map<String, Object> inputMap = new Map<String, Object>();
        Map<String, Object> outputMap = new Map<String, Object>();
        Map<String, Object> args = new Map<String, Object>{
            'input' => inputMap,
            'output' => outputMap
        };

        // Create an instance of the controller and call the method
        ProgramRadioOptionsController controller = new ProgramRadioOptionsController();
        Object result = controller.call('getProgramOptions', args);

        // Cast result to list
        List<Object> returnedOptions = (List<Object>)result;

        // Validate
        System.assertEquals(2, returnedOptions.size(), 'Should return only 2 programs');
        for (Object obj : returnedOptions) {
            Map<String, Object> opt = (Map<String, Object>)obj;
            System.assert(opt.containsKey('name'));
            System.assert(opt.containsKey('value'));
        }

        // Ensure output map also contains the result
        System.assert(outputMap.containsKey('options'));
    }

    @isTest
    static void testUnsupportedActionReturnsNull() {
        // Prepare empty input/output maps
        Map<String, Object> inputMap = new Map<String, Object>();
        Map<String, Object> outputMap = new Map<String, Object>();
        Map<String, Object> args = new Map<String, Object>{
            'input' => inputMap,
            'output' => outputMap
        };

        // Call with an unsupported action
        ProgramRadioOptionsController controller = new ProgramRadioOptionsController();
        Object result = controller.call('unsupportedAction', args);

        // Validate that null is returned
        System.assertEquals(null, result, 'Should return null for unsupported actions');
    }
}