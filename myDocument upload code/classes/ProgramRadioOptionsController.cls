global without sharing class ProgramRadioOptionsController implements System.Callable {
    
    // Main method called by OmniStudio - SubmitReferrals
    global Object call(String action, Map<String, Object> args) {
        Map<String, Object> inputMap = (Map<String, Object>)args.get('input');
        Map<String, Object> outputMap = (Map<String, Object>)args.get('output');
        if (action == 'getProgramOptions') {
            List<Map<String, Object>> options = new List<Map<String, Object>>();

            for (Program prog : [SELECT Id, Name, code__c FROM Program WHERE Available_for_Registration__c = TRUE]) {
                Map<String, Object> opt = new Map<String, Object>();
                opt.put('value', prog.Name != null ? prog.Name.trim() : '');
            	opt.put('name', prog.code__c != null ? prog.code__c.trim() : '');
                options.add(opt);
            }

            Map<String, Object> response = new Map<String, Object>();
            outputMap.put('options', options);

            return options;
        }
		
        return null;
    }
}