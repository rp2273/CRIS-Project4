import { Component } from '@angular/core';

interface ProjectData {
  [key: string]: {
    dataConsumed: { [key: string]: string };
    dataReceived: { [key: string]: string };
  };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  appXData: ProjectData = {};
  appYData: ProjectData = {};
  differences: Array<any> = [];

  loadFile(event: any, project: 'x' | 'y'): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const data = JSON.parse(e.target.result);
          if (project === 'x') {
            this.appXData = data;
          } else {
            this.appYData = data;
          }
        } catch (error) {
          console.error(`Error parsing Project ${project.toUpperCase()} JSON:`, error);
        }
      };
      reader.readAsText(file);
    }
  }

  displayData(data: ProjectData): Array<any> {
    return Object.entries(data).map(([key, value]) => ({
      key,
      consumed: Object.values(value.dataConsumed).filter(Boolean).join(', ') || 'N/A',
      received: Object.values(value.dataReceived).filter(Boolean).join(', ') || 'N/A',
    }));
  }

  modifyData(project: 'x' | 'y', key: string): void {
    const data = project === 'x' ? this.appXData : this.appYData;
    const projectData = data[key];

    const newDataConsumed = prompt(
      'Enter new Data Consumed (comma separated):',
      Object.values(projectData.dataConsumed).filter(Boolean).join(', ')
    );
    const newDataReceived = prompt(
      'Enter new Data Received (comma separated):',
      Object.values(projectData.dataReceived).filter(Boolean).join(', ')
    );

    if (newDataConsumed !== null) {
      const newDataConsumedArr = newDataConsumed.split(',').map(item => item.trim());
      projectData.dataConsumed = {};
      newDataConsumedArr.forEach((item, index) => {
        projectData.dataConsumed[`dataConsumed ${index + 1}`] = item;
      });
    }

    if (newDataReceived !== null) {
      const newDataReceivedArr = newDataReceived.split(',').map(item => item.trim());
      projectData.dataReceived = {};
      newDataReceivedArr.forEach((item, index) => {
        projectData.dataReceived[`dataReceived ${index + 1}`] = item;
      });
    }
  }

  compareData(): void {
    this.differences = this.compare(this.appXData, this.appYData);
  }

  compare(appXData: ProjectData, appYData: ProjectData): Array<any> {
    const differences = [];
    for (const key in appXData) {
      const appXConsumed = Object.values(appXData[key].dataConsumed).filter(Boolean).join(', ');
      const appXReceived = Object.values(appXData[key].dataReceived).filter(Boolean).join(', ');
      const appYConsumed = appYData[key] ? Object.values(appYData[key].dataConsumed).filter(Boolean).join(', ') : 'N/A';
      const appYReceived = appYData[key] ? Object.values(appYData[key].dataReceived).filter(Boolean).join(', ') : 'N/A';

      if (appXConsumed !== appYConsumed || appXReceived !== appYReceived) {
        differences.push({
          key,
          app_x_value: { consumed: appXConsumed, received: appXReceived },
          app_y_value: { consumed: appYConsumed, received: appYReceived },
        });
      }
    }
    return differences;
  }

  saveData(): void {
    this.download('project-x.json', JSON.stringify(this.appXData, null, 2));
    this.download('project-y.json', JSON.stringify(this.appYData, null, 2));
  }

  download(filename: string, text: string): void {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  highlightDifference(key: string, project: 'x' | 'y', type: 'consumed' | 'received'): boolean {
    const comparison = this.differences.find(d => d.key === key);
    if (!comparison) return false;
    if (project === 'x') {
      return comparison.app_x_value[type] !== comparison.app_y_value[type];
    } else {
      return comparison.app_y_value[type] !== comparison.app_x_value[type];
    }
  }
  
}
