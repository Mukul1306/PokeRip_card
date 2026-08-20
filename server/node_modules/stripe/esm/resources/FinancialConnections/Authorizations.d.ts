import { OtherString } from '../../shared.js';
export interface Authorization {
    /**
     * Unique identifier for the object.
     */
    id: string;
    /**
     * String representing the object's type. Objects of the same type share the same value.
     */
    object: 'financial_connections.authorization';
    /**
     * The name of the institution that this authorization belongs to.
     */
    institution_name: string;
    /**
     * If the object exists in live mode, the value is `true`. If the object exists in test mode, the value is `false`.
     */
    livemode: boolean;
    /**
     * The status of the connection to the Authorization.
     */
    status: Authorization.Status;
    status_details: Authorization.StatusDetails;
}
export declare namespace Authorization {
    type Status = 'active' | 'inactive' | OtherString;
    interface StatusDetails {
        active?: StatusDetails.Active;
        inactive?: StatusDetails.Inactive;
    }
    namespace StatusDetails {
        interface Active {
            /**
             * The action (if any) to proactively relink the Authorization.
             */
            action: Active.Action;
            /**
             * When the Authorization is expected to become inactive, if applicable.
             */
            expected_deactivation_date: number;
        }
        interface Inactive {
            /**
             * The action (if any) to relink the inactive Authorization.
             */
            action: Inactive.Action;
        }
        namespace Active {
            type Action = 'none' | 'relink_required' | OtherString;
        }
        namespace Inactive {
            type Action = 'none' | 'relink_required' | OtherString;
        }
    }
}
