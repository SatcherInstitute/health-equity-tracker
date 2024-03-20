#!/bin/bash

# Function to display usage information
usage() {
    echo "Usage: $0 -D <project_id>"
    echo "  -D      Delete disks that are not in use"
    echo "  project_id     The ID of the Google Cloud project"
}

# Parse command line options
while getopts ":D" opt; do
    case ${opt} in
        D )
            delete_disks=true
            ;;
        \? )
            echo "Invalid option: $OPTARG" 1>&2
            usage
            ;;
        : )
            echo "Invalid option: $OPTARG requires an argument" 1>&2
            usage
            ;;
    esac
done
shift $((OPTIND -1))

# Extract project ID
project_id=$1

# Warn the user if disks are to be deleted
echo "WARNING: This script will unused delete disks within the specified project that match the kind auto-created by Google Cloud Composer: pd-standard, 2GB, and prefixed with 'pvc-'."
if [ "$delete_disks" = true ]; then
    echo "This cannot be undone! Ctrl+C to cancel."
    echo "Proceeding with deletion in 3 seconds..."
		sleep 3
else
    echo "Showing which files would be deleted. To proceed with the actual deletion, rerun the script with the -D flag."
fi

# Find all persistent disks in the specified project along with their zones in CSV format
disks_zones=$(gcloud compute disks list --project="$project_id" --format="csv(name,zone,size_gb,type)" | tail -n +2)

# Iterate over the rows of disk details
while IFS=',' read -r disk_name full_zone size_gb disk_type; do

    # Extract the short zone string from the full zone URL
    zone=$(basename "$full_zone")

    # Check if disk size is 2GB, type is pd-standard, and the name starts with "pvc-"
    if [[ $size_gb -eq 2 && $disk_type == "pd-standard" && $disk_name == pvc-* ]]; then
        # Check if the disk is in use
        disk_info=$(gcloud compute disks describe "$disk_name" --zone="$zone" --project="$project_id" --format="value(users)" 2>/dev/null)
        if [[ -n "$disk_info" && $disk_info != NONE ]]; then
            echo "Disk $disk_name in zone $zone is in use by:"
            echo "$disk_info"
        else
						# Warn or delete the disk based on the -D flag
            if [ "$delete_disks" = true ]; then
                echo "Deleting unused disk $disk_name in zone $zone."
                gcloud compute disks delete "$disk_name" --zone="$zone" --project="$project_id" --quiet
            else
                echo "Disk $disk_name in zone $zone would be deleted."
            fi
        fi
    fi
done <<< "$disks_zones"

echo "All disks checked."
